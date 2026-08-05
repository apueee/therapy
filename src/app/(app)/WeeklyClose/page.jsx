"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, FileText, ClipboardList, DollarSign, ChevronRight } from "lucide-react";

const STATUS_COLORS = {
  draft: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  signed: "bg-teal-100 text-teal-700",
};

export default function WeeklyClose() {
  const draftVisits = [];
  const pendingTasks = [];
  const completedVisits = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Weekly Close</h1>
        <p className="text-slate-500 text-sm mt-1">Complete your weekly documentation checklist</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={draftVisits.length > 0 ? "border-amber-200" : "border-green-200"}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${draftVisits.length > 0 ? "bg-amber-100" : "bg-green-100"}`}>
              {draftVisits.length > 0 ? (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500">Draft Notes</p>
              <p className="text-2xl font-bold text-slate-900">{draftVisits.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Pending Tasks</p>
              <p className="text-2xl font-bold text-slate-900">{pendingTasks.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">This Week</p>
              <p className="text-2xl font-bold text-slate-900">{completedVisits.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Draft Visit Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {draftVisits.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-sm">All visit notes are completed!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {draftVisits.map(v => (
                <Link key={v.id} href={`/VisitNoteDetail?id=${v.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-sm text-slate-800">{v.patient_name}</p>
                      <p className="text-xs text-slate-500">{v.visit_date} · {v.therapy_type?.replace(" Therapy", "")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${STATUS_COLORS[v.status] || ""}`}>{v.status}</Badge>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-500" />
            Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-sm">All tasks completed!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <p className="font-medium text-sm text-slate-800">{task.title}</p>
                  <Badge variant="outline" className="text-xs">{task.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
