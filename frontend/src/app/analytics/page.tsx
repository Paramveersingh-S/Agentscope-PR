import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Deep dive into organization-wide review data.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
           <EmptyState title="Analytics coming soon" description="Detailed reporting charts will be available in the next release." />
        </CardContent>
      </Card>
    </div>
  );
}
