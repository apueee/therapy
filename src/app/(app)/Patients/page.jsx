"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Pencil, Trash2, List, UserPlus, ClipboardList, FileUp, BookOpen } from "lucide-react";

const statusBadge = {
  active: "bg-emerald-50 text-emerald-700",
  on_hold: "bg-amber-50 text-amber-700",
  discharged: "bg-slate-100 text-slate-500",
};

export default function Patients() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [activeTab, setActiveTab] = useState("list");

  const patients = [];

  const filtered = patients.filter((p) => {
    const matchesSearch = `${p.first_name} ${p.last_name} ${p.diagnosis || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patients</h1>
        <p className="text-slate-500 text-sm mt-1">{patients.length} total patients</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-5 h-auto">
          <TabsTrigger value="list" className="gap-2 py-2.5">
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Patient List</span>
          </TabsTrigger>
          <TabsTrigger value="referral-list" className="gap-2 py-2.5">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Referral List</span>
          </TabsTrigger>
          <TabsTrigger value="referral" className="gap-2 py-2.5">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Add Referral</span>
          </TabsTrigger>
          <TabsTrigger value="edit-referral" className="gap-2 py-2.5">
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Referral</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2 py-2.5">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Patient</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search patients…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("active")}
                className={statusFilter === "active" ? "bg-teal-600 hover:bg-teal-700" : ""}
              >
                Active Patients
              </Button>
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "bg-teal-600 hover:bg-teal-700" : ""}
              >
                All Patients
              </Button>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">City</TableHead>
                  <TableHead className="hidden lg:table-cell">Therapy</TableHead>
                  <TableHead className="hidden lg:table-cell">Auth #</TableHead>
                  <TableHead className="hidden xl:table-cell">Visits</TableHead>
                  <TableHead className="hidden md:table-cell">Agency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-slate-400">No patients found</TableCell></TableRow>
                ) : filtered.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/60">
                    <TableCell className="font-medium">
                      <Link href={`/PatientDetail?id=${p.id}`} className="text-teal-600 hover:text-teal-700 hover:underline">
                        {p.first_name} {p.last_name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-500">{p.city || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {(p.therapy_types || []).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t.replace(" Therapy", "")}</Badge>
                        ))}
                        {(!p.therapy_types || p.therapy_types.length === 0) && <span className="text-slate-500">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-slate-500">{p.authorization_number || "—"}</TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-slate-500">{p.authorized_visits || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-500">{p.agency || "—"}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusBadge[p.status] || ""}`}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="referral">
          <Tabs defaultValue="manual" className="space-y-4">
            <TabsList className="w-full max-w-xs">
              <TabsTrigger value="manual" className="gap-2 flex-1">
                <ClipboardList className="w-4 h-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="pdf" className="gap-2 flex-1">
                <FileUp className="w-4 h-4" />
                Import PDF
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
              <Card><CardContent className="p-8 text-center text-slate-400">Referral intake form placeholder</CardContent></Card>
            </TabsContent>
            <TabsContent value="pdf">
              <Card><CardContent className="p-8 text-center text-slate-400">PDF import placeholder</CardContent></Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="referral-list">
          <Card><CardContent className="p-8 text-center text-slate-400">Referral list placeholder</CardContent></Card>
        </TabsContent>

        <TabsContent value="edit-referral">
          <Card><CardContent className="p-8 text-center text-slate-400">Edit referral placeholder</CardContent></Card>
        </TabsContent>

        <TabsContent value="add">
          <div className="max-w-2xl">
            <Card>
              <CardContent className="p-6">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 gap-2">
                  <Plus className="w-4 h-4" /> Add New Patient
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
