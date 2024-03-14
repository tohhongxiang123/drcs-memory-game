import { motion } from "framer-motion";

export default function ProgressTimer({ progress }: { progress: number }) {
    return (
        <div className="flex h-4 w-full flex-col items-center justify-stretch px-8">
            <motion.div
                className={"h-full w-full rounded-full bg-emerald-500"}
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.2 }}
            />
        </div>
    );
}
