import { RecentReviews } from "@/components/dashboard/RecentReviews";

export default function ReviewsListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Reviews</h1>
        <p className="text-muted-foreground">Browse all historical pull request reviews.</p>
      </div>
      <RecentReviews />
    </div>
  );
}
