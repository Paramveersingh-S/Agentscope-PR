import { Finding } from "@/types";
import { FindingCard } from "./FindingCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function FindingsPanel({ findings }: { findings: Finding[] }) {
  if (!findings || findings.length === 0) {
    return <EmptyState title="No findings yet" description="Agents are either still running or found zero issues." />;
  }

  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
  const sortedFindings = [...findings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return (
    <div className="h-[800px] overflow-y-auto pr-4">
      <div className="flex flex-col gap-4">
        {sortedFindings.map((finding, idx) => (
          <FindingCard key={finding.id || idx} finding={finding} />
        ))}
      </div>
    </div>
  );
}
