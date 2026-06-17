import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PRReview } from "@/types";

const mockReviews: PRReview[] = [
  {
    id: "1", repository_id: "repo-1", pr_number: 142, pr_title: "Add OAuth2 integration",
    status: "completed", overall_score: 8.5, risk_level: "MEDIUM", block_merge: false,
    pr_author: "johndoe", agent_runs: [], findings: []
  },
  {
    id: "2", repository_id: "repo-1", pr_number: 143, pr_title: "Update dependencies",
    status: "running", risk_level: "HIGH", block_merge: false,
    pr_author: "janedoe", agent_runs: [], findings: []
  }
];

export function RecentReviews() {
  return (
    <Card className="col-span-7">
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PR</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="font-medium">#{review.pr_number} {review.pr_title}</div>
                  <div className="text-xs text-muted-foreground">by @{review.pr_author}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={review.status === "completed" ? "default" : "secondary"}>
                    {review.status}
                  </Badge>
                </TableCell>
                <TableCell>{review.overall_score ? `${review.overall_score}/10` : "-"}</TableCell>
                <TableCell>
                  {review.risk_level && (
                    <Badge variant="outline" className={review.risk_level === "CRITICAL" ? "text-red-500 border-red-500" : ""}>
                      {review.risk_level}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/reviews/${review.id}`} className="text-sm text-blue-500 hover:underline">
                    View Details
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
