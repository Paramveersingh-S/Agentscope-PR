import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AGENT_ICONS } from "@/lib/constants";
import * as Icons from "lucide-react";

interface AgentAvatarProps {
  agentName: string;
  size?: "sm" | "md" | "lg";
}

export function AgentAvatar({ agentName, size = "md" }: AgentAvatarProps) {
  const iconName = AGENT_ICONS[agentName as keyof typeof AGENT_ICONS] || "Bot";
  const Icon = Icons[iconName as keyof typeof Icons] as any;
  
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14"
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarFallback className="bg-muted">
        {Icon ? <Icon className="w-1/2 h-1/2 opacity-70" /> : <Icons.Bot className="w-1/2 h-1/2 opacity-70" />}
      </AvatarFallback>
    </Avatar>
  );
}
