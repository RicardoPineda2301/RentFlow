"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Contract = {
  id: string;
  apartmentProjectName: string;
  apartmentUnitNumber: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  monthlyRentRate: number;
  status: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const searchParams = useSearchParams();
  const expiringOnly = searchParams.get("expiring") === "true";
  const [message, setMessage] = useState<string>("");
  const [sortKey, setSortKey] = useState<
    "apartment" | "tenant" | "startDate" | "endDate" | "status" | "monthlyRentRate"
  >("endDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchContracts = async () => {
    const query = expiringOnly ? "?expiring=true" : "";
    const response = await fetch(`${API_BASE_URL}/contracts${query}`, { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as Contract[];
    setContracts(data);
  };

  useEffect(() => {
    fetchContracts();
  }, [expiringOnly]);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (selectedContractId) {
      formData.append("contractId", selectedContractId);
    }

    setUploading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setMessage("Upload failed. Please check backend S3/MinIO configuration.");
        return;
      }

      const result = await response.json();
      setMessage(`Upload successful. Object key: ${result.key}`);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const sortedContracts = useMemo(() => {
    const sorted = [...contracts];
    const direction = sortDirection === "asc" ? 1 : -1;

    sorted.sort((a, b) => {
      let left: string | number = "";
      let right: string | number = "";

      switch (sortKey) {
        case "apartment":
          left = a.apartmentUnitNumber;
          right = b.apartmentUnitNumber;
          break;
        case "tenant":
          left = a.tenantName;
          right = b.tenantName;
          break;
        case "startDate":
          left = new Date(a.startDate).getTime();
          right = new Date(b.startDate).getTime();
          break;
        case "endDate":
          left = new Date(a.endDate).getTime();
          right = new Date(b.endDate).getTime();
          break;
        case "status":
          left = a.status;
          right = b.status;
          break;
        case "monthlyRentRate":
          left = a.monthlyRentRate;
          right = b.monthlyRentRate;
          break;
      }

      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * direction;
      }

      return String(left).localeCompare(String(right)) * direction;
    });

    return sorted;
  }, [contracts, sortDirection, sortKey]);

  const toggleSort = (
    key: "apartment" | "tenant" | "startDate" | "endDate" | "status" | "monthlyRentRate",
  ) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const sortIndicator = (
    key: "apartment" | "tenant" | "startDate" | "endDate" | "status" | "monthlyRentRate",
  ) => {
    if (sortKey !== key) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
        <p className="text-muted-foreground">
          Upload signed contract files to S3-compatible storage (MinIO today, AWS S3 later).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Contract PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onUpload} className="grid gap-3 md:grid-cols-3">
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5"
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
            >
              <option value="">Upload without linking</option>
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.apartmentProjectName} · {contract.apartmentUnitNumber} - {contract.tenantName}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept="application/pdf"
              className="h-8 rounded-lg border border-input px-2 py-1 text-sm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </form>
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contracts ({contracts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {expiringOnly ? (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Showing leases expiring within the next 30 days. <a href="/contracts" className="font-semibold text-primary hover:underline">View all contracts</a>
            </div>
          ) : null}
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("apartment")}>
                    Apartment{sortIndicator("apartment")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("tenant")}>
                    Tenant{sortIndicator("tenant")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("startDate")}>
                    Start{sortIndicator("startDate")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("endDate")}>
                    End{sortIndicator("endDate")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("status")}>
                    Status{sortIndicator("status")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("monthlyRentRate")}>
                    Rent{sortIndicator("monthlyRentRate")}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No contracts found.</TableCell>
                </TableRow>
              ) : (
                sortedContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.apartmentProjectName} · {contract.apartmentUnitNumber}</TableCell>
                    <TableCell>{contract.tenantName}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(contract.startDate))}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(contract.endDate))}</TableCell>
                    <TableCell>{contract.status}</TableCell>
                    <TableCell>€{contract.monthlyRentRate.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
