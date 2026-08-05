"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart2, Users, FileText, Activity, TrendingUp } from "lucide-react";

const REPORT_MAP = {
  "Accounts Receivable Report": "ar",
  "Visit Allocation Report": "allocation",
  "Billed Visits": "billed",
  "Omits by Therapist": "omits",
  "Omits by Therapist - Trend": "omits_trend",
  "Omit Details": "omit_details",
  "Trended Referrals by Agency": "referrals",
  "Discharge List Report": "discharge",
  "Profitability Report": "profitability",
  "Missed Visit Report": "missed",
};

export default function ReportsPage() {
  return <Suspense fallback={<div className="py-12 text-center text-slate-400">Loading...</div>}><Reports /></Suspense>;
}

function Reports() {
  const searchParams = useSearchParams();
  const reportParam = searchParams.get("report");
  const activeReport = reportParam ? REPORT_MAP[reportParam] || "overview" : "overview";
  const activeReportLabel = reportParam || "Overview";

  const today = new Date().toISOString().split("T")[0];
  const sixMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 5));
  const [dateFrom, setDateFrom] = useState(`${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`);
  const [dateTo, setDateTo] = useState(today);

  const isOverview = activeReport === "overview";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{activeReportLabel}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isOverview ? "Analytics and insights across your practice" : `Showing data for: ${activeReportLabel}`}
        </p>
      </div>

      {!isOverview && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
            <BarChart2 className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-700 font-semibold text-lg mb-1">{activeReportLabel}</p>
            <p className="text-slate-400 text-sm">This report is coming soon. Data will be displayed here once implemented.</p>
          </CardContent>
        </Card>
      )}

      {isOverview && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <Label className="mb-1 block text-sm">Date From</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-44" />
                </div>
                <div>
                  <Label className="mb-1 block text-sm">Date To</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-44" />
                </div>
                <p className="text-sm text-slate-500 pb-1">0 visits in range</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Visits in Range", value: 0, icon: FileText, color: "text-teal-600 bg-teal-50" },
              { label: "Active Patients", value: 0, icon: Users, color: "text-blue-600 bg-blue-50" },
              { label: "Active Therapists", value: 0, icon: Activity, color: "text-violet-600 bg-violet-50" },
              { label: "Signed Notes", value: 0, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-xl font-bold text-slate-900">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart2 className="w-4 h-4 text-teal-600" /> Visits by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-slate-400">
                <p className="text-sm">Chart will render when data is available</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Visits by Discipline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <p className="text-sm">No data available</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Visits by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <p className="text-sm">No data available</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Visits per Therapist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm text-center py-6">No data for selected range</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
