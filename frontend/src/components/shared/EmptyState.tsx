import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
        <FileQuestion className="h-8 w-8 text-zinc-400" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
    </div>
  );
}
