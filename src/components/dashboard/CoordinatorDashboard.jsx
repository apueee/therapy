"use client";

import { Users, FileText, CalendarCheck, Clock, ChevronDown, ChevronUp, AlertCircle, XCircle, UserPlus, ClipboardList, Building2, BarChart2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import { useState } from "react";

export default function CoordinatorDashboard({ user }) {
  const [weeklyExpanded, setWeeklyExpanded] = useState(false);
  const [missedExpanded, setMissedExpanded] = useState(false);

  const quickActions = [
    { label: "New Orders", icon: ClipboardList, to: "/Orders", color: "text-teal-600 bg-teal-50 hover:bg-teal-100" },
    { label: "New Patient", icon: UserPlus, to: "/Patients", color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
    { label: "Agencies", icon: Building2, to: "/Agencies", color: "text-orange-600 bg-orange-50 hover:bg-orange-100" },
    { label: "Reports", icon: BarChart2, to: "/Reports", color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Coordinator Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage operations and documentation</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.to}>
            <div className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border border-transparent transition-all shadow-sm cursor-pointer ${action.color}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center">
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium whitespace-nowrap">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Active Patients" value={0} icon={Users} accent="bg-teal-50 text-teal-600" />
        <StatCard label="Delayed Visits" value={0} icon={AlertCircle} accent="bg-red-50 text-red-600" />
        <div className="col-span-2 lg:col-span-1">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setMissedExpanded(p => !p)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Missed Visits</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
                {missedExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </CardContent>
          </Card>
        </div>
        <StatCard label="Drafts" value={0} icon={Clock} accent="bg-amber-50 text-amber-600" />
        <div className="col-span-2 lg:col-span-1">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setWeeklyExpanded(p => !p)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Weekly Scheduled</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
                {weeklyExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Referrals */}
      <Card>
        <CardContent className="p-6">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
            <ClipboardList className="w-5 h-5 text-teal-600" />
            Pending Referrals
            <Badge variant="secondary" className="ml-auto">0</Badge>
          </h3>
          <div className="text-center py-8 text-slate-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No pending referrals</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Visits */}
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No visit notes yet</p>
        </CardContent>
      </Card>
    </div>
  );
}
