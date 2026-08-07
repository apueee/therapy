"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, CheckCircle, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

const therapyColor = {
  "Physical Therapy": "bg-blue-100 text-blue-700",
  "Occupational Therapy": "bg-purple-100 text-purple-700",
  "Speech Therapy": "bg-amber-100 text-amber-700",
};

const PTA_COTA = ["PTA", "COTA"];

export default function OrdersAwaitingApproval({ visits, therapists = [], agencies = [] }) {
  const [approveDialog, setApproveDialog] = useState(null);
  const [approvedVisits, setApprovedVisits] = useState([]);
  const [treatingTherapistId, setTreatingTherapistId] = useState("");
  const [supervisingTherapistId, setSupervisingTherapistId] = useState("");

  const pendingEvals = visits.filter(
    (v) =>
      (v.visit_type === "evaluation" || (v.visit_type === "re_evaluation" && v.create_update_orders === "Yes")) &&
      (v.status === "completed" || v.status === "signed") &&
      !v.treatment_approved
  );

  const openDialog = (visit) => {
    const weeklyVisits = visit.therapy_orders?.weekly_visits || [];
    setApprovedVisits(weeklyVisits.map((w) => ({ ...w, approved_visits: w.visits ?? 0 })));
    setTreatingTherapistId("");
    setSupervisingTherapistId("");
    setApproveDialog(visit);
  };

  const getAvailableTherapists = (therapyType, patientAgency) => {
    const agencyRecord = agencies.find(a => a.name === patientAgency);
    const assistantsAllowed = agencyRecord ? agencyRecord.assistants_allowed !== false : true;
    return therapists.filter((t) => {
      if (t.status !== "active" || t.discipline !== therapyType) return false;
      if (!assistantsAllowed && PTA_COTA.includes(t.credentials?.trim().toUpperCase())) return false;
      return true;
    });
  };

  // Mock mutation as no-op
  const approveMutation = { mutate: () => {}, isPending: false };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-teal-600" />
            Orders Awaiting Approval
            <Badge variant="secondary" className="ml-auto">{pendingEvals.length}</Badge>
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Completed evaluations and re-evaluations with new orders pending approval
          </p>
        </CardHeader>
        <CardContent>
          {pendingEvals.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No evaluations awaiting approval</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvals.map((visit) => (
                <div key={visit.id} className="p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-slate-900">{visit.patient_name}</span>
                        <Badge className={`text-xs ${therapyColor[visit.therapy_type] || ""}`}>
                          {visit.therapy_type?.replace(" Therapy", "")}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {visit.visit_type?.replace("_", "-")}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {visit.visit_date ? format(new Date(visit.visit_date), "MMM d, yyyy") : "—"}
                        </div>
                        {visit.therapist_name && <div>Evaluator: {visit.therapist_name}</div>}
                        {visit.agency && <div>Agency: {visit.agency}</div>}
                        {visit.therapy_orders?.frequency && (
                          <div>Requested: {visit.therapy_orders.frequency}x/wk × {visit.therapy_orders?.weekly_visits?.length || 0} wks</div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => openDialog(visit)}
                        className="bg-teal-600 hover:bg-teal-700 gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Review & Approve
                      </Button>
                      <Link href={`/VisitNoteDetail?id=${visit.id}`}>
                        <Button size="sm" variant="outline" className="gap-1 w-full">
                          <Eye className="w-3.5 h-3.5" /> View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {approveDialog && (
        <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review & Approve Treatment Orders</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-medium text-slate-900">{approveDialog.patient_name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {approveDialog.therapy_type} · {approveDialog.visit_type === "re_evaluation" ? "Re-Evaluation" : "Evaluation"} on{" "}
                  {approveDialog.visit_date ? format(new Date(approveDialog.visit_date), "MMM d, yyyy") : "—"}
                </p>
              </div>

              {/* Weekly visits table */}
              {approvedVisits.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Weekly Visit Schedule</p>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-slate-100 text-xs font-semibold text-slate-500 uppercase">
                      <span>Week</span>
                      <span className="text-center">Requested</span>
                      <span className="text-center">Approved</span>
                    </div>
                    {approvedVisits.map((week, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 items-center px-3 py-2 border-t text-sm">
                        <div>
                          <div className="font-medium text-slate-700">{week.week_label || `Week ${i + 1}`}</div>
                          {week.week_start && (
                            <div className="text-[10px] text-slate-400">{week.week_start} – {week.week_end}</div>
                          )}
                        </div>
                        <div className="text-center text-slate-600">{week.visits ?? "—"}</div>
                        <div className="flex justify-center">
                          <Input
                            type="number"
                            min="0"
                            max="7"
                            value={week.approved_visits}
                            onChange={(e) => {
                              const updated = [...approvedVisits];
                              updated[i] = { ...updated[i], approved_visits: e.target.value };
                              setApprovedVisits(updated);
                            }}
                            className="w-16 h-7 text-center text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assign treating therapist */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Assign Treating Therapist *</p>
                <Select value={treatingTherapistId} onValueChange={setTreatingTherapistId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select treating therapist" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTherapists(approveDialog.therapy_type, approveDialog.agency).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.full_name} {t.credentials && `(${t.credentials})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getAvailableTherapists(approveDialog.therapy_type, approveDialog.agency).length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No active therapists found for {approveDialog.therapy_type}</p>
                )}
              </div>

              {/* Assign supervising therapist */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Supervising Therapist <span className="text-slate-400 font-normal">(optional)</span>
                </p>
                <Select value={supervisingTherapistId} onValueChange={setSupervisingTherapistId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervising therapist (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {getAvailableTherapists(approveDialog.therapy_type, approveDialog.agency).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.full_name} {t.credentials && `(${t.credentials})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialog(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => approveMutation.mutate(approveDialog)}
                disabled={!treatingTherapistId || approveMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {approveMutation.isPending ? "Approving..." : "Approve & Assign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
