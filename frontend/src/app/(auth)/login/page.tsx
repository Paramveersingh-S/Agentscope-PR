import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to PR Sentinel</h1>
          <p className="text-sm text-muted-foreground">Agentic Code Reviews for your entire team.</p>
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Github className="h-5 w-5" />
          Login with GitHub
        </button>
      </div>
    </div>
  );
}
