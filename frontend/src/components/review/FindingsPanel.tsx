import { useReviewStore } from '@/store/useReviewStore';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export function FindingsPanel() {
  const findings = useReviewStore(state => state.liveFindings);

  if (findings.length === 0) {
    return (
      <div className="glass rounded-xl p-8 border border-border/50 flex flex-col items-center justify-center h-64 text-center">
        <ShieldAlert className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">Swarm is analyzing...</p>
        <p className="text-sm text-muted-foreground/60 mt-2">Findings will appear here in real-time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map(finding => (
        <div key={finding.id} className="glass rounded-xl p-6 border border-border/50 transition-all hover:bg-accent/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {finding.severity === 'CRITICAL' || finding.severity === 'HIGH' ? (
                <AlertTriangle className="w-5 h-5 text-destructive mr-3" />
              ) : (
                <Info className="w-5 h-5 text-primary mr-3" />
              )}
              <h4 className="text-lg font-semibold text-white">{finding.title}</h4>
            </div>
            <div className="flex space-x-2">
              <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full border 
                ${finding.severity === 'CRITICAL' || finding.severity === 'HIGH' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                {finding.severity}
              </span>
              <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                {finding.agent_name}
              </span>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            {finding.description}
          </p>
          
          {finding.file_path && (
            <div className="bg-background rounded-md p-3 border border-border/50">
              <div className="text-xs font-mono text-muted-foreground mb-2 flex items-center">
                <span className="text-primary mr-2">File:</span>
                {finding.file_path}
                {finding.line_start && ` (Line ${finding.line_start}${finding.line_end && finding.line_end !== finding.line_start ? `-${finding.line_end}` : ''})`}
              </div>
              {finding.code_snippet && (
                <pre className="text-xs text-white overflow-x-auto p-2 bg-[#0b0f19] rounded border border-border/30">
                  <code>{finding.code_snippet}</code>
                </pre>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
