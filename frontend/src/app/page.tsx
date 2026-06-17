import { StatsCards } from "@/components/dashboard/StatsCards";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { RiskDistribution } from "@/components/dashboard/RiskDistribution";
import { RecentReviews } from "@/components/dashboard/RecentReviews";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your pull request security and quality metrics.</p>
      </div>
      
      <StatsCards />
      
      <div className="grid gap-4 md:grid-cols-7">
        <TrendChart />
        <RiskDistribution />
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <RecentReviews />
      </div>
    </div>
  );
}
