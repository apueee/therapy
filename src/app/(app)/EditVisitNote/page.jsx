"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import VisitNoteForm from "@/components/visits/VisitNoteForm";
import { toast } from "sonner";

function EditVisitNoteContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const effectiveUser = { role: "therapist", user_type: "therapist", full_name: "User", email: "user@example.com" };
  const isAdmin = ["admin", "superuser"].includes(effectiveUser?.role) || ["admin", "superuser"].includes(effectiveUser?.user_type);

  const visit = null;
  const isLoading = false;

  const patients = [];
  const therapists = [];

  const handleSave = async (data) => {
    console.log("save:", data);
    toast.success("Visit note updated successfully");
    router.push(`/VisitNoteDetail?id=${id}`);
  };

  const handleAutoSave = async (data) => {
    console.log("save:", data);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20 text-slate-400">Loading…</div>;
  }

  if (!visit) {
    return <div className="flex justify-center py-20 text-slate-400">Visit note not found</div>;
  }

  const isCompleted = visit.status === "completed" || visit.status === "signed";
  const canEdit = !isCompleted || isAdmin;

  if (isCompleted && !isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => router.push(`/VisitNoteDetail?id=${id}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Visit Note</h1>
            <p className="text-slate-500 text-sm mt-0.5">{visit.patient_name}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          <Lock className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Visit Note Locked</p>
            <p className="text-sm mt-1">This visit note has been completed and is locked. Contact an administrator to unlock it for editing.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => router.push(`/VisitNoteDetail?id=${id}`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Visit Note</h1>
          <p className="text-slate-500 text-sm mt-0.5">{visit.patient_name}</p>
        </div>
      </div>

      <VisitNoteForm
        patients={patients}
        therapists={therapists}
        onSave={handleSave}
        onAutoSave={handleAutoSave}
        initial={visit}
      />
    </div>
  );
}

export default function EditVisitNote() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-slate-400">Loading…</div>}>
      <EditVisitNoteContent />
    </Suspense>
  );
}