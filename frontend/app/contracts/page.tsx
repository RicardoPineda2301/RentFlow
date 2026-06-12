"use client";

import { useEffect, useState } from "react";
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
  const [message, setMessage] = useState<string>("");

  const fetchContracts = async () => {
    const response = await fetch(`${API_BASE_URL}/contracts`, { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as Contract[];
    setContracts(data);
  };

  useEffect(() => {
    fetchContracts();
  }, []);

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
                  {contract.apartmentUnitNumber} - {contract.tenantName}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apartment</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No contracts found.</TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.apartmentUnitNumber}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
