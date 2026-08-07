"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const therapyColor = {
  "Physical Therapy": "bg-blue-50 text-blue-700 border-blue-200",
  "Occupational Therapy": "bg-amber-50 text-amber-700 border-amber-200",
  "Speech Therapy": "bg-violet-50 text-violet-700 border-violet-200",
};
const statusColor = {
  draft: "bg-slate-100 text-slate-600",
  completed: "bg-emerald-50 text-emerald-700",
  signed: "bg-teal-50 text-teal-700",
};

export default function VisitNotes() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const effectiveUser = { role: "therapist", user_type: "therapist", full_name: "User", email: "user@example.com" };
  const isAdmin = ["admin", "superuser"].includes(effectiveUser?.user_type) || ["admin", "superuser"].includes(effectiveUser?.role);

  const allVisits = [];
  const isLoading = false;

  // Therapists only see their own visits
  const visits = isAdmin
    ? allVisits
    : allVisits.filter(v => v.therapist_name === effectiveUser?.full_name || v.therapist_id === effectiveUser?.id);

  const handleDelete = async (id) => {
    console.log("delete:", id);
  };

  const filtered = visits.filter((v) => {
    const matchSearch = `${v.patient_name} ${v.therapist_name} ${v.facility || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || v.therapy_type === filterType;
    const matchStatus = filterStatus === "all" || v.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visit Notes</h1>
          <p className="text-slate-500 text-sm mt-1">{visits.length} total documentation records</p>
        </div>
        <Link href="/NewVisitNote">
          <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
            <Plus className="w-4 h-4" /> New Visit Note
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search visits…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Disciplines</SelectItem>
            <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
            <SelectItem value="Occupational Therapy">Occupational Therapy</SelectItem>
            <SelectItem value="Speech Therapy">Speech Therapy</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead className="hidden md:table-cell">Therapist</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Discipline</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">No visit notes found</TableCell></TableRow>
            ) : filtered.map((v) => (
              <TableRow key={v.id} className="hover:bg-slate-50/60">
                <TableCell className="font-medium">{v.patient_name}</TableCell>
                <TableCell className="hidden md:table-cell text-sm text-slate-500">{v.therapist_name}</TableCell>
                <TableCell className="text-sm">{v.visit_date ? format(new Date(v.visit_date), "MMM d, yyyy") : "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${therapyColor[v.therapy_type] || ""}`}>
                    {v.therapy_type?.replace(" Therapy", "")}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-slate-500 capitalize">{v.visit_type?.replace("_", "-") || "—"}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${statusColor[v.status] || ""}`}>{v.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/VisitNoteDetail?id=${v.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-3.5 h-3.5 text-slate-400" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(v.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}