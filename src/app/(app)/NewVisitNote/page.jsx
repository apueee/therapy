"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewVisitNote() {
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
      <Card>
        <CardContent className="p-8 text-center text-slate-400">
          Visit note form placeholder — will be connected to backend
        </CardContent>
      </Card>
    </div>
  );
}
