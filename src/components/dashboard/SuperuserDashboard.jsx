"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, UserCheck, FileText, Building2, Shield, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentVisits from "@/components/dashboard/RecentVisits";
import TherapyBreakdown from "@/components/dashboard/TherapyBreakdown";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getPatients } from "@/app/(app)/Patients/actions";
import { getTherapists } from "@/app/(app)/Therapists/actions";
import { getCalendarVisits } from "@/app/(app)/VisitCalendar/actions";
import { getAgencies } from "@/app/(app)/Agencies/actions";
import { getUsers } from "@/app/(app)/UserManagement/actions";

export default function SuperuserDashboard() {
  const [patients, setPatients] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [visits, setVisits] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    Promise.all([getPatients(), getTherapists(), getCalendarVisits(), getAgencies(), getUsers()])
      .then(([p, t, v, a, u]) => { setPatients(p); setTherapists(t); setVisits(v); setAgencies(a); setUsers(u); })
      .catch(console.error);
  }, []);

  const activePatients = patients.filter((p) => p.status === "active").length;
  const activeTherapists = therapists.filter((t) => t.status === "active").length;
  const drafts = visits.filter((v) => v.status === "draft").length;
  const activeAgencies = agencies.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Superuser Dashboard</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">System-wide overview and management</p>
        </div>
        <Link href="/NewVisitNote">
          <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
            <Plus className="w-4 h-4" /> New Visit Note
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Active Patients" value={activePatients} icon={Users} accent="bg-teal-50 text-teal-600" />
        <StatCard label="Therapists" value={activeTherapists} icon={UserCheck} accent="bg-blue-50 text-blue-600" />
        <StatCard label="Total Visits" value={visits.length} icon={FileText} accent="bg-violet-50 text-violet-600" />
        <StatCard label="Agencies" value={activeAgencies} icon={Building2} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Total Users" value={users.length} icon={Shield} accent="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentVisits visits={visits.slice(0, 10)} />
        </div>
        <TherapyBreakdown visits={visits} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/UserManagement">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" /> Manage Users
              </Button>
            </Link>
            <Link href="/Agencies">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="w-4 h-4 mr-2" /> Manage Agencies
              </Button>
            </Link>
            <Link href="/Therapists">
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="w-4 h-4 mr-2" /> Manage Therapists
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Draft Notes</span>
                <span className="font-semibold text-amber-600">{drafts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Completed</span>
                <span className="font-semibold text-green-600">{visits.filter(v => v.status === "completed").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Signed</span>
                <span className="font-semibold text-teal-600">{visits.filter(v => v.status === "signed").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">User Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Therapists</span>
                <span className="font-semibold">{users.filter(u => u.user_type === "therapist").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admins</span>
                <span className="font-semibold">{users.filter(u => u.user_type === "admin").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clients</span>
                <span className="font-semibold">{users.filter(u => u.user_type === "client").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
