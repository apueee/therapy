"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Eye, Trash2 } from "lucide-react";

const THERAPY_SHORT = {
  "Physical Therapy": "PT",
  "Occupational Therapy": "OT",
  "Speech Therapy": "ST",
};

const statusColors = {
  draft: "bg-slate-100 text-slate-600",
  completed: "bg-blue-50 text-blue-700",
  signed: "bg-green-50 text-green-700",
  scheduled: "bg-amber-50 text-amber-700",
};

function VisitTable({ visits, emptyMessage }) {
  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <ClipboardList className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {visits.map((v) => (
        <div key={v.id} className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 transition-colors">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800">{v.patient_name}</p>
            <p className="text-xs text-slate-500">{v.therapist_name} · {v.visit_date}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs">{THERAPY_SHORT[v.therapy_type] || v.therapy_type}</Badge>
            <Badge className={`text-xs ${statusColors[v.status] || ""}`}>{v.status}</Badge>
            <Link href={`/VisitNoteDetail?id=${v.id}`}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  return <Suspense fallback={<div className="py-12 text-center text-slate-400">Loading...</div>}><Orders /></Suspense>;
}

function Orders() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "deletions";

  const evalOrders = [];
  const recertOrders = [];
  const dischargeOrders = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
        <p className="text-slate-500 text-sm mt-1">Manage evaluation, recertification, and discharge orders</p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="h-auto">
          <TabsTrigger value="deletions" className="gap-2 py-2.5 px-5">
            <Trash2 className="w-4 h-4" />
            Medical Record Deletions
          </TabsTrigger>
          <TabsTrigger value="eval" className="gap-2 py-2.5 px-5">
            Eval Orders
            <Badge className="bg-teal-100 text-teal-700 text-xs ml-1">{evalOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="recert" className="gap-2 py-2.5 px-5">
            Recert Orders
            <Badge className="bg-blue-100 text-blue-700 text-xs ml-1">{recertOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="discharge" className="gap-2 py-2.5 px-5">
            Discharge Orders
            <Badge className="bg-amber-100 text-amber-700 text-xs ml-1">{dischargeOrders.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deletions">
          <Card>
            <CardContent className="p-6 text-center text-slate-400">
              Medical record deletions placeholder
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eval">
          <Card>
            <CardContent className="p-0">
              <VisitTable visits={evalOrders} emptyMessage="No evaluation orders found" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recert">
          <Card>
            <CardContent className="p-0">
              <VisitTable visits={recertOrders} emptyMessage="No recertification orders found" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discharge">
          <Card>
            <CardContent className="p-0">
              <VisitTable visits={dischargeOrders} emptyMessage="No discharge orders found" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
