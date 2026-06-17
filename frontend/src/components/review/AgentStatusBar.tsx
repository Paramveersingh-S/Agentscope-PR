import { useReviewStore, AgentStatus } from '@/store/useReviewStore';
import { ShieldAlert, Zap, Code, TestTube, FileText, PackageCheck, Loader2, CheckCircle2, Circle } from 'lucide-react';

const agentIcons: Record<string, React.ReactNode> = {
  security: <ShieldAlert className="w-5 h-5" />,
  performance: <Zap className="w-5 h-5" />,
  code_quality: <Code className="w-5 h-5" />,
  test_coverage: <TestTube className="w-5 h-5" />,
  documentation: <FileText className="w-5 h-5" />,
  dependency: <PackageCheck className="w-5 h-5" />,
};

const agentNames: Record<string, string> = {
  security: 'Security Audit',
  performance: 'Performance',
  code_quality: 'Code Quality',
  test_coverage: 'Test Coverage',
  documentation: 'Documentation',
  dependency: 'Dependencies',
};

export function AgentStatusBar() {
  const activeAgents = useReviewStore(state => state.activeAgents);

  const getStatusVisuals = (status: AgentStatus) => {
    switch(status) {
      case 'running': return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed': return <Circle className="w-4 h-4 text-destructive" />;
      default: return <Circle className="w-4 h-4 text-muted-foreground opacity-50" />;
    }
  };

  const getBorderColor = (status: AgentStatus) => {
    switch(status) {
      case 'running': return 'border-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      case 'completed': return 'border-green-500/50';
      case 'failed': return 'border-destructive/50';
      default: return 'border-border/50';
    }
  };

  return (
    <div className="w-full glass rounded-xl p-6 border border-border/50 mb-8">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow mr-3"></div>
        Live Swarm Intelligence
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(activeAgents).map(([key, status]) => (
          <div key={key} className={`flex flex-col items-center justify-center p-4 rounded-lg border bg-background/50 transition-all duration-300 ${getBorderColor(status)}`}>
            <div className={`mb-3 ${status === 'running' ? 'text-primary animate-pulse' : status === 'completed' ? 'text-green-500' : 'text-muted-foreground'}`}>
              {agentIcons[key]}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 text-center h-8 flex items-center">
              {agentNames[key]}
            </span>
            {getStatusVisuals(status)}
          </div>
        ))}
      </div>
    </div>
  );
}
