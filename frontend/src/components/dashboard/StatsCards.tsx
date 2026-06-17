import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitPullRequest, AlertTriangle, ShieldAlert, Activity } from "lucide-react";

export function StatsCards() {
  const stats = [
    { title: "Total Reviews", value: "1,248", change: "+12%", icon: GitPullRequest },
    { title: "Avg. Security Score", value: "9.2", change: "+0.4", icon: ShieldAlert },
    { title: "Critical Findings", value: "14", change: "-3", icon: AlertTriangle },
    { title: "Active Agents", value: "7", change: "100%", icon: Activity },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.change.startsWith('+') ? (
                <span className="text-green-500">{stat.change} from last month</span>
              ) : (
                <span className="text-red-500">{stat.change} from last month</span>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
