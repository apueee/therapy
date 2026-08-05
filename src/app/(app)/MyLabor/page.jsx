"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, BarChart2, ChevronLeft, ChevronRight } from "lucide-react";
import ClockInOut from "@/components/coordinator/ClockInOut";

function formatDuration(mins) {
  if (!mins) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function MyLabor() {
  const [view, setView] = useState("weekly");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Labor</h1>
        <p className="text-slate-500 text-sm mt-1">Track your hours and view your labor history</p>
      </div>

      <ClockInOut />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setView("weekly")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${view === "weekly" ? "bg-teal-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-l border-slate-200 ${view === "monthly" ? "bg-teal-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            Monthly
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-slate-700 min-w-[200px] text-center">Current Period</span>
          <Button size="icon" variant="outline" className="h-8 w-8" disabled>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Hours</p>
              <p className="text-xl font-bold text-slate-800">{formatDuration(0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Days Worked</p>
              <p className="text-xl font-bold text-slate-800">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Avg Per Day</p>
              <p className="text-xl font-bold text-slate-800">{formatDuration(0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-700">Shift Log</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="py-10 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No shifts recorded for this period</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
