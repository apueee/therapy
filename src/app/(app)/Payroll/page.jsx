"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Calculator, ChevronDown, ChevronUp, Printer } from "lucide-react";

export default function Payroll() {
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = today.slice(0, 8) + "01";
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);
  const [selectedTherapistIds, setSelectedTherapistIds] = useState([]);
  const [results, setResults] = useState(null);
  const [expanded, setExpanded] = useState({});

  const therapists = [];

  const toggleTherapist = (id) => {
    setSelectedTherapistIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedTherapistIds(therapists.map((t) => t.id));
  const clearAll = () => setSelectedTherapistIds([]);

  const toggleExpand = (tid) => setExpanded((p) => ({ ...p, [tid]: !p[tid] }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll</h1>
          <p className="text-slate-500 text-sm mt-1">Calculate therapist pay by visit count and rates</p>
        </div>
        {results && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print / Export
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <Label className="mb-1 block text-sm">Date From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-44" />
              </div>
              <div>
                <Label className="mb-1 block text-sm">Date To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-44" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Therapists <span className="text-slate-400 font-normal">(leave all unselected to include everyone)</span></Label>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs text-teal-600 hover:underline">Select All</button>
                  <span className="text-slate-300">|</span>
                  <button onClick={clearAll} className="text-xs text-slate-500 hover:underline">Clear</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {therapists.filter(t => t.status === "active").map((t) => {
                  const active = selectedTherapistIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTherapist(t.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"
                      }`}
                    >
                      {t.full_name}{t.credentials ? ` (${t.credentials})` : ""}
                    </button>
                  );
                })}
                {therapists.length === 0 && <p className="text-sm text-slate-400">No therapists loaded</p>}
              </div>
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
              <Calculator className="w-4 h-4" /> Run Payroll
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            No completed visits found for this date range.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
