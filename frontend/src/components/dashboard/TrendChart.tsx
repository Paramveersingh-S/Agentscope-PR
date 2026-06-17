"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Mon', findings: 12 },
  { name: 'Tue', findings: 19 },
  { name: 'Wed', findings: 15 },
  { name: 'Thu', findings: 22 },
  { name: 'Fri', findings: 8 },
  { name: 'Sat', findings: 2 },
  { name: 'Sun', findings: 5 },
];

export function TrendChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Findings Trend</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="findings" stroke="#09090b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
