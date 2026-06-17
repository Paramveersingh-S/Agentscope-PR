import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ScoreGauge({ score }: { score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 8) return "text-green-500";
    if (s >= 5) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <Card className="flex flex-col items-center justify-center p-6 bg-zinc-900 text-white border-zinc-800">
      <div className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-widest">Quality Score</div>
      <div className="relative flex items-center justify-center w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-zinc-800"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={getScoreColor(score)}
            strokeDasharray={`${(score / 10) * 100}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className={cn("absolute text-4xl font-bold", getScoreColor(score))}>
          {score.toFixed(1)}
        </div>
      </div>
    </Card>
  );
}
