"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import VisitNoteForm from "@/components/visits/VisitNoteForm";

export default function NewVisitNote() {
  const router = useRouter();
  const [draftId, setDraftId] = useState(null);

  const patients = [];
  const therapists = [];

  const handleSave = async (data) => {
    console.log("save:", data);
    router.push("/VisitNotes");
  };

  const handleAutoSave = async (data) => {
    console.log("save:", data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/VisitNotes">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Visit Note</h1>
          <p className="text-slate-500 text-sm mt-0.5">Document a therapy visit</p>
        </div>
      </div>
      <VisitNoteForm patients={patients} therapists={therapists} onSave={handleSave} onAutoSave={handleAutoSave} />
    </div>
  );
}