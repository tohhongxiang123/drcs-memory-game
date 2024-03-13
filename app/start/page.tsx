"use client";

import { Button } from "@/components/ui/button";
import Game from "./_components/game";
import useGame from "./hooks/use-game";
import { Check, Play, RotateCcw, SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StartGame() {
    const {
        gameState,
        isRevealed,
        start,
        showSuccess,
        level,
        reset,
        cells,
        selectCell,
        confirmUserSelection,
    } = useGame();

    return (
        <div className="flex h-full flex-col items-center justify-center gap-4">
            {gameState.isCompleted ? (
                <>
                    <h1 className="mb-4 text-5xl font-bold">
                        Congratulations!
                    </h1>
                    <p className="mb-16 text-muted-foreground">
                        You have completed all the levels!
                    </p>
                    <Button size="lg" onClick={reset}>
                        Restart
                    </Button>
                </>
            ) : (
                <>
                    <p
                        className={cn(
                            "text-3xl font-bold",
                            level < 0 && "opacity-0"
                        )}
                    >
                        Level {level + 1}
                    </p>
                    <div className="relative h-[80vw] w-[80vw] lg:h-[50vw] lg:w-[50vw] xl:h-[40vw] xl:w-[40vw]">
                        {showSuccess && (
                            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-8 border-emerald-800 bg-emerald-400/90 p-8 shadow-lg backdrop-blur-sm">
                                <Check className="h-48 w-48" />
                            </div>
                        )}
                        {gameState.isIdle ? (
                            <div className="absolute left-1/2 top-1/2 z-10 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                                <Button onClick={start} size="xl">
                                    <Play className="mr-4 h-8 w-8" />{" "}
                                    <span>Start</span>
                                </Button>
                            </div>
                        ) : (
                            <Game>
                                {cells.map(({ id, selected, isTarget }) => (
                                    <Game.Cell
                                        key={id}
                                        selected={selected}
                                        isTarget={isTarget}
                                        isRevealed={isRevealed}
                                        onClick={() => selectCell(id)}
                                    />
                                ))}
                            </Game>
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        {gameState.isStarting && (
                            <Button disabled size="xl">
                                Starting...
                            </Button>
                        )}
                        {gameState.isRunning && (
                            <Button
                                size="xl"
                                onClick={confirmUserSelection}
                                className={cn(
                                    showSuccess ? "bg-emerald-500" : ""
                                )}
                                disabled={isRevealed || showSuccess}
                            >
                                <span className="flex items-center">
                                    {showSuccess ? (
                                        "Success!"
                                    ) : isRevealed ? (
                                        "Wait..."
                                    ) : (
                                        <>
                                            <span>Confirm</span>
                                            <SendHorizonal className="ml-4 h-8 w-8" />
                                        </>
                                    )}
                                </span>
                            </Button>
                        )}
                        {gameState.isGameOver && (
                            <Button onClick={reset} size="xl">
                                <RotateCcw className="mr-4 h-8 w-8" />{" "}
                                <span>Restart</span>
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
