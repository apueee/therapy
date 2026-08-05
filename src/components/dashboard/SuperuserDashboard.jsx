"use client";

import { Users, UserCheck, FileText, Building2, Shield, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SuperuserDashboard() {
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
        <StatCard label="Active Patients" value={0} icon={Users} accent="bg-teal-50 text-teal-600" />
        <StatCard label="Therapists" value={0} icon={UserCheck} accent="bg-blue-50 text-blue-600" />
        <StatCard label="Total Visits" value={0} icon={FileText} accent="bg-violet-50 text-violet-600" />
        <StatCard label="Agencies" value={0} icon={Building2} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Total Users" value={0} icon={Shield} accent="bg-purple-50 text-purple-600" />
      </div>

      {/* Recent Visits */}
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No visit notes yet</p>
        </CardContent>
      </Card>

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
                <span className="font-semibold text-amber-600">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Completed</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Signed</span>
                <span className="font-semibold text-teal-600">0</span>
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
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admins</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clients</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
