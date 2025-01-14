import { useState } from "react";
import useCountdown from "./use-countdown";
import useLevelState from "./use-level-state";
import useSoundWithMutedContext from "./use-sound-with-muted-context";

const levels = [
    { size: 3, targets: 3 },
    { size: 3, targets: 4 },
    { size: 4, targets: 4 },
    { size: 4, targets: 5 },
    { size: 4, targets: 6 },
    { size: 5, targets: 5 },
    { size: 5, targets: 6 },
    { size: 5, targets: 7 },
    { size: 6, targets: 6 },
    { size: 7, targets: 7 },
];

enum GameState {
    IDLE = "IDLE",
    STARTING = "STARTING",
    RUNNING = "RUNNING",
    WAITING_FOR_USER = "WAITING_FOR_USER",
    SHOW_SUCCESS = "SHOW_SUCCESS",
    GENERATING = "GENERATING",
    REVEALED = "REVEALED",
    FAILED = "FAILED",
    COMPLETE = "COMPLETE",
}

const DEFAULT_HINTS = 3;

export default function useGame({
    startTimeMs,
    revealTimeMs,
}: {
    startTimeMs: number;
    revealTimeMs: number;
}) {
    const [gameState, setGameState] = useState(GameState.IDLE);
    const { cells, level, deselectAll, initializeLevel, selectCell } =
        useLevelState(levels);

    const [playReveal] = useSoundWithMutedContext("./audio/reveal.mp3");
    const [playGo] = useSoundWithMutedContext("./audio/go.mp3");

    const {
        msRemaining: revealCountdownTimeMs,
        startTimer: startRevealTimer,
        resetTimer: resetRevealTimer,
    } = useCountdown({
        timeMs: revealTimeMs,
        onTimerStart() {
            setGameState(GameState.REVEALED);
            playReveal();
        },
        onTimerEnd() {
            setGameState(GameState.WAITING_FOR_USER);
            playGo();
        },
    });

    const beginLevel = async (newLevel: number) => {
        setGameState(GameState.GENERATING);
        deselectAll();

        resetRevealTimer();

        await new Promise((resolve) => setTimeout(resolve, 400));

        initializeLevel(newLevel);

        await new Promise((resolve) => setTimeout(resolve, 700));
        setGameState(GameState.IDLE);
        startRevealTimer();
    };

    const {
        msRemaining: readyCountdownTimeMs,
        startTimer: startReadyCountdown,
    } = useCountdown({
        timeMs: startTimeMs,
        intervalMs: 1000,
        onTimerStart() {
            setGameState(GameState.STARTING);
        },
        onTimerEnd() {
            setGameState(GameState.RUNNING);
            beginLevel(level);
        },
    });

    const start = () => {
        startReadyCountdown();
    };

    const [hasCompletedGame, setHasCompletedGame] = useState(false);
    const levelUp = () => {
        if (level === levels.length - 1 && !hasCompletedGame) {
            setHasCompletedGame(true);
            setGameState(GameState.COMPLETE);
            return;
        }

        setGameState(GameState.GENERATING);
        beginLevel(level + 1);
    };

    const { startTimer: startSuccessTimer } = useCountdown({
        timeMs: revealTimeMs,
        intervalMs: revealTimeMs,
        onTimerStart() {
            setGameState(GameState.SHOW_SUCCESS);
        },
        onTimerEnd() {
            levelUp();
        },
    });

    const [playSelect] = useSoundWithMutedContext("./audio/select.mp3", {
        playbackRate: 0.75 + cells.filter((c) => c.selected).length * 0.16,
    });

    const handleSelectCell = (id: number) => {
        playSelect();
        selectCell(id);
    };

    const [playCorrect] = useSoundWithMutedContext("./audio/correct.mp3");
    const [playWrong] = useSoundWithMutedContext("./audio/wrong.mp3");

    const confirmUserSelection = () => {
        const succeeded = cells.every(
            (cell) => cell.selected === cell.isTarget
        );

        if (succeeded) {
            playCorrect();
            startSuccessTimer();
        } else {
            playWrong();
            gameOver();
        }
    };

    const [hintsRemaining, setHintsRemaining] = useState(DEFAULT_HINTS);
    const getHint = () => {
        if (hintsRemaining === 0) return;
        setHintsRemaining((c) => c - 1);
        startRevealTimer();
    };

    const gameOver = () => {
        setGameState(GameState.FAILED);
    };

    const reset = () => {
        setHasCompletedGame(false);
        setGameState(GameState.IDLE);
        setHintsRemaining(DEFAULT_HINTS);
        initializeLevel(0);
    };

    const continueGame = () => {
        initializeLevel(level + 1);
        startReadyCountdown();
    };

    return {
        gameState: {
            isStarting: gameState === GameState.STARTING,
            isIdle: gameState === GameState.IDLE,
            isRunning: gameState === GameState.RUNNING,
            isGameOver: gameState === GameState.FAILED,
            isWaitingUserInput: gameState === GameState.WAITING_FOR_USER,
            isCompleted: gameState === GameState.COMPLETE,
            isRevealed:
                gameState === GameState.REVEALED ||
                gameState === GameState.FAILED ||
                gameState === GameState.SHOW_SUCCESS,
            isGenerating: gameState === GameState.GENERATING,
            isShowingSuccess: gameState === GameState.SHOW_SUCCESS,
            hasCompletedGame,
        },
        levelInfo: {
            level,
            cells,
        },
        hintsRemaining,
        getHint,
        revealCountdownTimeMs,
        readyCountdownTimeMs,
        start,
        reset,
        continueGame,
        selectCell: handleSelectCell,
        confirmUserSelection,
    };
}
