"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EditVisitNotePage() {
  return <Suspense fallback={<div className="py-12 text-center text-slate-400">Loading...</div>}><EditVisitNote /></Suspense>;
}

function EditVisitNote() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={id ? `/VisitNoteDetail?id=${id}` : "/VisitNotes"}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Visit Note</h1>
          <p className="text-slate-500 text-sm mt-0.5">Update visit documentation</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-8 text-center text-slate-400">
          Edit visit note form placeholder — will be connected to backend
        </CardContent>
      </Card>
    </div>
  );
}
