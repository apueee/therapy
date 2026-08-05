"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Settings, ShieldCheck, User, Users } from "lucide-react";

const ALL_NAV_PAGES = [
  { key: "Dashboard", label: "Dashboard" },
  { key: "MySchedule", label: "My Schedule" },
  { key: "MyTasks", label: "My Tasks" },
  { key: "MyProfile", label: "My Profile" },
  { key: "MyPatients", label: "My Patients" },
  { key: "Patients", label: "Patients" },
  { key: "Therapists", label: "Therapists" },
  { key: "VisitNotes", label: "Visit Notes" },
  { key: "VisitCalendar", label: "Visit Calendar" },
  { key: "Agencies", label: "Agencies" },
  { key: "Invoices", label: "Billing" },
  { key: "Payroll", label: "Payroll" },
  { key: "Reports", label: "Reports" },
  { key: "CompanyInformation", label: "Company Info" },
  { key: "TaskAssignment", label: "Task Assignment" },
  { key: "Orders", label: "Orders" },
  { key: "DocumentLibrary", label: "Document Library" },
  { key: "UserManagement", label: "User Administration" },
  { key: "CompanySettings", label: "Company Settings" },
  { key: "CoordinatorTasks", label: "My Tasks (Coordinator)" },
  { key: "MyLabor", label: "My Labor (Coordinator)" },
];

const ROLES = [
  { key: "admin", label: "Admin", icon: ShieldCheck, color: "text-teal-600" },
  { key: "therapist", label: "Therapist", icon: User, color: "text-blue-600" },
  { key: "coordinator", label: "Coordinator", icon: Users, color: "text-violet-600" },
  { key: "guest", label: "Guest", icon: User, color: "text-slate-500" },
  { key: "client", label: "Agency/Client", icon: User, color: "text-amber-600" },
];

export default function CompanySettings() {
  const [permissions, setPermissions] = useState({});
  const [activeRole, setActiveRole] = useState("admin");

  const rolePerms = permissions[activeRole] || [];

  const togglePage = (pageKey) => {
    setPermissions(prev => {
      const current = prev[activeRole] || [];
      const updated = current.includes(pageKey)
        ? current.filter(k => k !== pageKey)
        : [...current, pageKey];
      return { ...prev, [activeRole]: updated };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure menu permissions by role</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ROLES.map(role => (
          <button
            key={role.key}
            onClick={() => setActiveRole(role.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              activeRole === role.key
                ? "bg-teal-50 border-teal-300 text-teal-700"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <role.icon className={`w-4 h-4 ${role.color}`} />
            {role.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4 text-teal-600" />
            Menu Permissions for {ROLES.find(r => r.key === activeRole)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ALL_NAV_PAGES.map(page => {
              const isEnabled = rolePerms.includes(page.key);
              return (
                <button
                  key={page.key}
                  onClick={() => togglePage(page.key)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                    isEnabled
                      ? "bg-teal-50 border-teal-200 text-teal-700"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <span className="font-medium">{page.label}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isEnabled ? "border-teal-500 bg-teal-500" : "border-slate-300"
                  }`}>
                    {isEnabled && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
