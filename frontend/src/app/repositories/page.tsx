import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Github, Plus } from "lucide-react";
import Link from "next/link";

const mockRepos = [
  { id: "1", name: "acme-corp/frontend", active: true, policy: "Strict", score: 9.2 },
  { id: "2", name: "acme-corp/backend-api", active: true, policy: "Default", score: 8.8 },
  { id: "3", name: "acme-corp/legacy-app", active: false, policy: "Permissive", score: 6.5 },
];

export default function RepositoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">Manage connected GitHub repositories and review policies.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Connect Repository</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockRepos.map((repo) => (
          <Card key={repo.id} className="relative overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  {repo.name}
                </CardTitle>
                <div className="mt-2 flex gap-2">
                  <Badge variant={repo.active ? "default" : "secondary"}>
                    {repo.active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{repo.policy}</Badge>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-green-500">{repo.score}</span>
                <span className="text-xs text-muted-foreground">Avg Score</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mt-4">
                <Link href={`/repositories/${repo.id}`} className="w-full">
                  <Button variant="outline" className="w-full">Configure Policy</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
