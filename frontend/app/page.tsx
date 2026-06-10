import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, AlertTriangle, ArrowUpRight } from "lucide-react";

export default function DashboardHome() {
  // Mock metrics mirroring typical landlord data setups
  const metrics = [
    { title: "Total Apartments", value: "48", icon: Building2, description: "Across 3 residential blocks" },
    { title: "Occupancy Rate", value: "92%", icon: Users, description: "44 Active tenants out of 48 total" },
    { title: "Pending Collections", value: "$4,200", icon: AlertTriangle, description: "5 overdue rents this month", color: "text-destructive" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Real-time portfolio performance tracking.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color || "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Insights Section */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>System Trends & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border p-4 bg-card">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Upcoming Contract Expirations</p>
                <p className="text-xs text-muted-foreground">3 leases are expiring within the next 30 days (Apt 104, Apt 202, Apt 311).</p>
              </div>
              <button className="text-xs font-semibold text-primary flex items-center gap-1">
                Review Leases <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}