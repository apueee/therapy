"use client";

import { FileText, Calendar, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const therapyColors = {
  "Physical Therapy": "bg-blue-100 text-blue-800 border-blue-200",
  "Occupational Therapy": "bg-purple-100 text-purple-800 border-purple-200",
  "Speech Therapy": "bg-amber-100 text-amber-800 border-amber-200",
};

export default function ClientDashboard({ user }) {
  const myVisits = [];
  const myPatient = null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Therapy Portal</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome, {user?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Visits</p>
                <p className="text-2xl font-bold text-slate-900">{myVisits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Last Visit</p>
                <p className="text-lg font-semibold text-slate-900">—</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center">
                <Activity className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="text-lg font-semibold text-slate-900">{myPatient?.status || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">My Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          {myVisits.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No visit records yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myVisits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge className={therapyColors[visit.therapy_type] || "bg-slate-100 text-slate-800"}>
                        {visit.therapy_type?.replace(" Therapy", "") || "Therapy"}
                      </Badge>
                      <span className="text-sm font-medium text-slate-900">
                        {visit.visit_date}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Therapist: {visit.therapist_name || "—"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {visit.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
