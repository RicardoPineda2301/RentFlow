import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, AlertTriangle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import DashboardCharts from "@/components/dashboard/charts";

type DashboardSummary = {
  totalApartments: number;
  occupiedApartments: number;
  occupancyRate: number;
  pendingCollections: number;
  pendingPaymentsCount: number;
  expiringContractsCount: number;
  expiringContracts: Array<{
    id: string;
    endDate: string;
    apartmentUnitNumber: string;
  }>;
};

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

async function getDashboardSummary(): Promise<DashboardSummary | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  try {
    const response = await fetch(`${apiBaseUrl}/dashboard/summary`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as DashboardSummary;
  } catch {
    return null;
  }
}

export default async function DashboardHome() {
  const summary = await getDashboardSummary();

  const metrics = summary
    ? [
        {
          title: "Total Apartments",
          value: String(summary.totalApartments),
          icon: Building2,
          description: `Across occupied and available units`,
        },
        {
          title: "Occupancy Rate",
          value: `${summary.occupancyRate.toFixed(1)}%`,
          icon: Users,
          description: `${summary.occupiedApartments} occupied out of ${summary.totalApartments}`,
        },
        {
          title: "Pending Collections",
          value: currencyFormatter.format(summary.pendingCollections),
          icon: AlertTriangle,
          description: `${summary.pendingPaymentsCount} pending or overdue payments`,
          color: "text-destructive",
        },
      ]
    : [
        {
          title: "Total Apartments",
          value: "-",
          icon: Building2,
          description: "Backend unavailable",
        },
        {
          title: "Occupancy Rate",
          value: "-",
          icon: Users,
          description: "Backend unavailable",
        },
        {
          title: "Pending Collections",
          value: "-",
          icon: AlertTriangle,
          description: "Backend unavailable",
          color: "text-destructive",
        },
      ];

  const expiringContracts = summary?.expiringContracts ?? [];
  const expiringText = expiringContracts.length
    ? expiringContracts
        .map(
          (contract) =>
            `${contract.apartmentUnitNumber} (${dateFormatter.format(new Date(contract.endDate))})`,
        )
        .join(", ")
    : "No active leases expiring in the next 30 days.";

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

      {/* Charts Section */}
      <DashboardCharts />

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
                <p className="text-xs text-muted-foreground">
                  {summary
                    ? `${summary.expiringContractsCount} leases are expiring within the next 30 days. ${expiringText}`
                    : "Unable to load expiring leases right now."}
                </p>
              </div>
              <Link href="/contracts" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                Review Leases <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
