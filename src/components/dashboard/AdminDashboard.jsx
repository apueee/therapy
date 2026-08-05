"use client";

import { Users, FileText, CalendarCheck, Clock, ChevronDown, ChevronUp, AlertCircle, XCircle, UserPlus, ClipboardList, Building2, Receipt, DollarSign, BarChart2, UserCog, Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import { useState } from "react";

export default function AdminDashboard() {
  const [weeklyExpanded, setWeeklyExpanded] = useState(false);
  const [missedExpanded, setMissedExpanded] = useState(false);

  const quickActions = [
    { label: "New Orders", icon: ClipboardList, to: "/Orders", color: "text-teal-600 bg-teal-50 hover:bg-teal-100" },
    { label: "New Patient", icon: UserPlus, to: "/Patients", color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
    { label: "Visit Notes", icon: ClipboardList, to: "/VisitNotes", color: "text-violet-600 bg-violet-50 hover:bg-violet-100" },
    { label: "Calendar", icon: CalendarCheck, to: "/VisitCalendar", color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
    { label: "Agencies", icon: Building2, to: "/Agencies", color: "text-orange-600 bg-orange-50 hover:bg-orange-100" },
    { label: "Billing", icon: Receipt, to: "/Invoices", color: "text-rose-600 bg-rose-50 hover:bg-rose-100" },
    { label: "Payroll", icon: DollarSign, to: "/Payroll", color: "text-amber-600 bg-amber-50 hover:bg-amber-100" },
    { label: "Reports", icon: BarChart2, to: "/Reports", color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" },
    { label: "Users", icon: UserCog, to: "/UserManagement", color: "text-slate-600 bg-slate-100 hover:bg-slate-200" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage operations and documentation</p>
        </div>
        <Link href="/NewVisitNote">
          <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
            <Plus className="w-4 h-4" /> New Visit Note
          </Button>
        </Link>
      </div>

      {/* Quick Action Shortcuts */}
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

      {/* Pending Referrals placeholder */}
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

      {/* Awaiting Acceptance */}
      <Card>
        <CardContent className="p-6">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            Awaiting Acceptance
            <Badge variant="secondary" className="ml-auto">0</Badge>
          </h3>
          <div className="text-center py-8 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No pending assignments</p>
          </div>
        </CardContent>
      </Card>

      {/* Orders Awaiting Approval */}
      <Card>
        <CardContent className="p-6">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
            <ClipboardList className="w-5 h-5 text-teal-600" />
            Orders Awaiting Approval
            <Badge variant="secondary" className="ml-auto">0</Badge>
          </h3>
          <div className="text-center py-8 text-slate-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No evaluations awaiting approval</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Visits */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Visits</h3>
          <div className="text-center py-8 text-slate-400">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm">No visit notes yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
