import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ContractListing = {
  id: string;
  apartmentUnitNumber: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  monthlyRentRate: number;
  status: string;
};

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

async function getContractsList(): Promise<ContractListing[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  try {
    const response = await fetch(`${apiBaseUrl}/contracts`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as ContractListing[];
  } catch {
    return [];
  }
}

export default async function LeasesPage() {
  const contracts = await getContractsList();

  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "TERMINATED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leases & Contracts</h1>
        <p className="text-muted-foreground">Manage all active and past lease agreements.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contracts ({contracts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No contracts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Apartment</th>
                    <th className="text-left py-3 px-4 font-semibold">Tenant</th>
                    <th className="text-left py-3 px-4 font-semibold">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold">End Date</th>
                    <th className="text-right py-3 px-4 font-semibold">Monthly Rent</th>
                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{contract.apartmentUnitNumber}</td>
                      <td className="py-3 px-4">{contract.tenantName}</td>
                      <td className="py-3 px-4">
                        {dateFormatter.format(new Date(contract.startDate))}
                      </td>
                      <td className="py-3 px-4">
                        {dateFormatter.format(new Date(contract.endDate))}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {currencyFormatter.format(contract.monthlyRentRate)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(contract.status)}`}>
                          {contract.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
