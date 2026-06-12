"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Tenant = {
  id: string;
  firstNames: string;
  lastNames: string;
  email: string;
  phone: string;
};

type TenantForm = {
  firstNames: string;
  lastNames: string;
  email: string;
  phone: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const emptyForm: TenantForm = {
  firstNames: "",
  lastNames: "",
  email: "",
  phone: "",
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [form, setForm] = useState<TenantForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "email" | "phone">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    return params.toString();
  }, [search]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const url = queryString ? `${API_BASE_URL}/tenants?${queryString}` : `${API_BASE_URL}/tenants`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as Tenant[];
      setTenants(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [queryString]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `${API_BASE_URL}/tenants/${editingId}` : `${API_BASE_URL}/tenants`;
    const method = editingId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      alert("Unable to save tenant. Email must be unique.");
      return;
    }

    resetForm();
    fetchTenants();
  };

  const onEdit = (tenant: Tenant) => {
    setEditingId(tenant.id);
    setForm({
      firstNames: tenant.firstNames,
      lastNames: tenant.lastNames,
      email: tenant.email,
      phone: tenant.phone,
    });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this tenant?")) return;
    const response = await fetch(`${API_BASE_URL}/tenants/${id}`, { method: "DELETE" });
    if (!response.ok) {
      alert("Unable to delete tenant. It may be linked to contracts.");
      return;
    }
    fetchTenants();
  };

  const sortedTenants = useMemo(() => {
    const sorted = [...tenants];
    const direction = sortDirection === "asc" ? 1 : -1;

    sorted.sort((a, b) => {
      let left = "";
      let right = "";

      switch (sortKey) {
        case "name":
          left = `${a.firstNames} ${a.lastNames}`;
          right = `${b.firstNames} ${b.lastNames}`;
          break;
        case "email":
          left = a.email;
          right = b.email;
          break;
        case "phone":
          left = a.phone;
          right = b.phone;
          break;
      }

      return left.localeCompare(right) * direction;
    });

    return sorted;
  }, [sortDirection, sortKey, tenants]);

  const toggleSort = (key: "name" | "email" | "phone") => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const sortIndicator = (key: "name" | "email" | "phone") => {
    if (sortKey !== key) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
        <p className="text-muted-foreground">Create, update, delete and search tenant records.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Tenant" : "Create Tenant"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-4">
            <Input
              placeholder="First names"
              value={form.firstNames}
              onChange={(e) => setForm((prev) => ({ ...prev, firstNames: e.target.value }))}
              required
            />
            <Input
              placeholder="Last names"
              value={form.lastNames}
              onChange={(e) => setForm((prev) => ({ ...prev, lastNames: e.target.value }))}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              required
            />
            <div className="flex items-center gap-2 md:col-span-4">
              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tenant List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("name")}>
                    Name{sortIndicator("name")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("email")}>
                    Email{sortIndicator("email")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("phone")}>
                    Phone{sortIndicator("phone")}
                  </button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4}>Loading...</TableCell>
                </TableRow>
              ) : sortedTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>No tenants found.</TableCell>
                </TableRow>
              ) : (
                sortedTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>{tenant.firstNames} {tenant.lastNames}</TableCell>
                    <TableCell>{tenant.email}</TableCell>
                    <TableCell>{tenant.phone}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(tenant)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(tenant.id)}>
                        Delete
                      </Button>
                    </TableCell>
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
