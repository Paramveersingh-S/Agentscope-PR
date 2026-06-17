import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function RepositoryPolicyPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Policy Configuration</h1>
          <p className="text-muted-foreground">Manage agent behavior for acme-corp/backend-api</p>
        </div>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">Active Agents</TabsTrigger>
          <TabsTrigger value="thresholds">Blocking Thresholds</TabsTrigger>
        </TabsList>
        <TabsContent value="agents" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Agent</CardTitle>
              <CardDescription>Scans for vulnerabilities, secrets, and OWASP top 10.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center space-x-2">
              <Switch id="security" defaultChecked />
              <Label htmlFor="security">Enabled</Label>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Code Quality Agent</CardTitle>
              <CardDescription>Reviews code readability, SOLID principles, and best practices.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center space-x-2">
              <Switch id="quality" defaultChecked />
              <Label htmlFor="quality">Enabled</Label>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
