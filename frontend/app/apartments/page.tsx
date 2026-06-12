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
  imageKeys: string[];
  activeContractId: string | null;
  activeContractPdfKey: string | null;
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
const APARTMENT_IMAGES_BUCKET = process.env.NEXT_PUBLIC_S3_APARTMENT_IMAGES_BUCKET ?? "rentflowtest02images";

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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageMessage, setImageMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [sortKey, setSortKey] = useState<
    "project" | "unitNumber" | "sizeM2" | "bedrooms" | "status" | "monthlyRent"
  >("monthlyRent");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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

  const selectedApartment = useMemo(
    () => apartments.find((apartment) => apartment.id === editingId) ?? null,
    [apartments, editingId],
  );

  const getApartmentImageUrl = (apartmentId: string, key: string) =>
    `${API_BASE_URL}/apartments/${apartmentId}/images/redirect?key=${encodeURIComponent(key)}`;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchApartments();
  }, [queryString]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFiles([]);
    setImageMessage("");
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

  const onUploadImages = async () => {
    if (!editingId) {
      setImageMessage("Save the apartment first, then upload images.");
      return;
    }

    if (imageFiles.length === 0) {
      setImageMessage("Select one or more image files first.");
      return;
    }

    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("files", file));

    setUploadingImages(true);
    setImageMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/apartments/${editingId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setImageMessage("Unable to upload apartment images. Check MinIO bucket access.");
        return;
      }

      const result = (await response.json()) as {
        uploadedImages: Array<{ key: string; filename: string }>;
      };
      setImageFiles([]);
      if (result.uploadedImages.length > 0) {
        window.location.assign(
          `${API_BASE_URL}/apartments/${editingId}/images/redirect?key=${encodeURIComponent(result.uploadedImages[0].key)}`,
        );
        return;
      }
      fetchApartments();
    } finally {
      setUploadingImages(false);
    }
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

  const sortedApartments = useMemo(() => {
    const sorted = [...apartments];
    const direction = sortDirection === "asc" ? 1 : -1;

    sorted.sort((a, b) => {
      let left: string | number = "";
      let right: string | number = "";

      switch (sortKey) {
        case "project":
          left = a.project?.name || "";
          right = b.project?.name || "";
          break;
        case "unitNumber":
          left = a.unitNumber;
          right = b.unitNumber;
          break;
        case "sizeM2":
          left = a.sizeM2;
          right = b.sizeM2;
          break;
        case "bedrooms":
          left = a.bedrooms;
          right = b.bedrooms;
          break;
        case "status":
          left = a.status;
          right = b.status;
          break;
        case "monthlyRent":
          left = a.monthlyRent;
          right = b.monthlyRent;
          break;
      }

      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * direction;
      }

      return String(left).localeCompare(String(right)) * direction;
    });

    return sorted;
  }, [apartments, sortDirection, sortKey]);

  const toggleSort = (
    key: "project" | "unitNumber" | "sizeM2" | "bedrooms" | "status" | "monthlyRent",
  ) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const sortIndicator = (
    key: "project" | "unitNumber" | "sizeM2" | "bedrooms" | "status" | "monthlyRent",
  ) => {
    if (sortKey !== key) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
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
        <CardContent className="space-y-6">
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

          {editingId ? (
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">Apartment Images</p>
                  <p className="text-sm text-muted-foreground">
                    Upload images to {APARTMENT_IMAGES_BUCKET} for this apartment.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedApartment?.imageKeys?.length ?? 0} image(s) attached
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
                />
                <Button type="button" onClick={onUploadImages} disabled={uploadingImages}>
                  {uploadingImages ? "Uploading..." : "Upload Images"}
                </Button>
              </div>

              {imageMessage ? <p className="text-sm text-muted-foreground">{imageMessage}</p> : null}

              {selectedApartment?.imageKeys?.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedApartment.imageKeys.map((key) => (
                    <a
                      key={key}
                      href={getApartmentImageUrl(selectedApartment.id, key)}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-lg border bg-muted"
                    >
                      <img
                        src={getApartmentImageUrl(selectedApartment.id, key)}
                        alt={key}
                        className="h-40 w-full object-cover"
                      />
                      <div className="px-3 py-2 text-xs text-muted-foreground truncate">
                        {key}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Save an apartment first to attach images from the S3 bucket.
            </p>
          )}
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

          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("project")}>
                    Project{sortIndicator("project")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("unitNumber")}>
                    Unit{sortIndicator("unitNumber")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("sizeM2")}>
                    Size{sortIndicator("sizeM2")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("bedrooms")}>
                    Beds/Baths{sortIndicator("bedrooms")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("status")}>
                    Status{sortIndicator("status")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("monthlyRent")}>
                    Rent{sortIndicator("monthlyRent")}
                  </button>
                </TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9}>Loading...</TableCell>
                </TableRow>
              ) : sortedApartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>No apartments found.</TableCell>
                </TableRow>
              ) : (
                sortedApartments.map((apartment) => (
                  <TableRow key={apartment.id}>
                    <TableCell>{apartment.project?.name || "-"}</TableCell>
                    <TableCell>{`${apartment.project?.name || "-"} · ${apartment.unitNumber}`}</TableCell>
                    <TableCell>{apartment.sizeM2} m²</TableCell>
                    <TableCell>
                      {apartment.bedrooms}/{apartment.bathrooms}
                    </TableCell>
                    <TableCell>{apartment.status}</TableCell>
                    <TableCell>€{apartment.monthlyRent.toLocaleString()}</TableCell>
                    <TableCell>{apartment.imageKeys?.length ?? 0}</TableCell>
                    <TableCell>
                      {apartment.activeContractId && apartment.activeContractPdfKey ? (
                        <a
                          href={`${API_BASE_URL}/contracts/${apartment.activeContractId}/pdf/redirect`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button size="sm" variant="outline">Contract PDF</Button>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No PDF</span>
                      )}
                    </TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
