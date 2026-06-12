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

type Project = {
  id: string;
  name: string;
};

type Apartment = {
  id: string;
  projectId: string;
  unitNumber: string;
  sizeM2: number;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  status: string;
  project?: { name: string };
};

type ApartmentForm = {
  projectId: string;
  unitNumber: string;
  sizeM2: string;
  bedrooms: string;
  bathrooms: string;
  monthlyRent: string;
  status: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const emptyForm: ApartmentForm = {
  projectId: "",
  unitNumber: "",
  sizeM2: "",
  bedrooms: "",
  bathrooms: "",
  monthlyRent: "",
  status: "AVAILABLE",
};

export default function ApartmentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [form, setForm] = useState<ApartmentForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    if (projectFilter) params.set("projectId", projectFilter);
    return params.toString();
  }, [projectFilter, search, statusFilter]);

  const fetchProjects = async () => {
    const response = await fetch(`${API_BASE_URL}/projects`, { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as Project[];
    setProjects(data);
  };

  const fetchApartments = async () => {
    setLoading(true);
    try {
      const url = queryString
        ? `${API_BASE_URL}/apartments?${queryString}`
        : `${API_BASE_URL}/apartments`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as Apartment[];
      setApartments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchApartments();
  }, [queryString]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      projectId: form.projectId,
      unitNumber: form.unitNumber,
      sizeM2: Number(form.sizeM2),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      monthlyRent: Number(form.monthlyRent),
      status: form.status,
    };

    const url = editingId ? `${API_BASE_URL}/apartments/${editingId}` : `${API_BASE_URL}/apartments`;
    const method = editingId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      alert("Unable to save apartment. Check if unit number is unique per project.");
      return;
    }

    resetForm();
    fetchApartments();
  };

  const onEdit = (apartment: Apartment) => {
    setEditingId(apartment.id);
    setForm({
      projectId: apartment.projectId,
      unitNumber: apartment.unitNumber,
      sizeM2: String(apartment.sizeM2),
      bedrooms: String(apartment.bedrooms),
      bathrooms: String(apartment.bathrooms),
      monthlyRent: String(apartment.monthlyRent),
      status: apartment.status,
    });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this apartment?")) return;
    const response = await fetch(`${API_BASE_URL}/apartments/${id}`, { method: "DELETE" });
    if (!response.ok) {
      alert("Unable to delete apartment. It may have related contracts.");
      return;
    }
    fetchApartments();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apartments</h1>
        <p className="text-muted-foreground">Create, update, delete, search and filter apartment inventory.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Apartment" : "Create Apartment"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-4">
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5"
              value={form.projectId}
              onChange={(e) => setForm((prev) => ({ ...prev, projectId: e.target.value }))}
              required
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Unit number"
              value={form.unitNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, unitNumber: e.target.value }))}
              required
            />
            <Input
              type="number"
              step="0.1"
              placeholder="Size m²"
              value={form.sizeM2}
              onChange={(e) => setForm((prev) => ({ ...prev, sizeM2: e.target.value }))}
              required
            />
            <Input
              type="number"
              placeholder="Bedrooms"
              value={form.bedrooms}
              onChange={(e) => setForm((prev) => ({ ...prev, bedrooms: e.target.value }))}
              required
            />
            <Input
              type="number"
              placeholder="Bathrooms"
              value={form.bathrooms}
              onChange={(e) => setForm((prev) => ({ ...prev, bathrooms: e.target.value }))}
              required
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Monthly rent"
              value={form.monthlyRent}
              onChange={(e) => setForm((prev) => ({ ...prev, monthlyRent: e.target.value }))}
              required
            />
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
            <div className="flex items-center gap-2">
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
          <CardTitle>Apartment List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Search by unit or project"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Beds/Baths</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>Loading...</TableCell>
                </TableRow>
              ) : apartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>No apartments found.</TableCell>
                </TableRow>
              ) : (
                apartments.map((apartment) => (
                  <TableRow key={apartment.id}>
                    <TableCell>{apartment.project?.name || "-"}</TableCell>
                    <TableCell>{apartment.unitNumber}</TableCell>
                    <TableCell>{apartment.sizeM2} m²</TableCell>
                    <TableCell>
                      {apartment.bedrooms}/{apartment.bathrooms}
                    </TableCell>
                    <TableCell>{apartment.status}</TableCell>
                    <TableCell>€{apartment.monthlyRent.toLocaleString()}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(apartment)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(apartment.id)}>
                        Delete
                      </Button>
                    </TableCell>
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
