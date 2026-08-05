"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, List, FileText, Trash2, Eye } from "lucide-react";

const statusColors = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-green-50 text-green-700",
  partial_paid: "bg-amber-50 text-amber-700",
  void: "bg-red-50 text-red-600",
};

const BILLING_TAB_MAP = {
  "Invoice Manager": "create",
  "Receive Checks": "receive_checks",
  "Find a Check": "find_check",
  "Edit Special Pricing": "special_pricing",
  "Edit Rate Level Pricing": "rate_level",
  "Edit Visit Add-Ons": "addons",
  "Edit Invoice": "edit_invoice",
  "Medicare Part B Billing": "medicare",
};

export default function InvoicesPage() {
  return <Suspense fallback={<div className="py-12 text-center text-slate-400">Loading...</div>}><Invoices /></Suspense>;
}

function Invoices() {
  const searchParams = useSearchParams();
  const reportParam = searchParams.get("report");
  const defaultTab = reportParam && BILLING_TAB_MAP[reportParam] ? BILLING_TAB_MAP[reportParam] : "list";

  const [activeTab, setActiveTab] = useState(defaultTab);

  const invoices = [];

  const placeholderTabs = ["receive_checks","find_check","special_pricing","rate_level","addons","edit_invoice","medicare"];
  const isPlaceholder = placeholderTabs.includes(activeTab);
  const activeLabel = reportParam && BILLING_TAB_MAP[reportParam] ? reportParam : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing</h1>
        <p className="text-slate-500 text-sm mt-1">{invoices.length} total invoices</p>
      </div>

      {isPlaceholder ? (
        <div className="rounded-xl border bg-white p-12 flex flex-col items-center justify-center text-center">
          <FileText className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-700 font-semibold text-lg mb-1">{activeLabel}</p>
          <p className="text-slate-400 text-sm">This feature is coming soon. It will be available here once implemented.</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 h-auto">
            <TabsTrigger value="create" className="gap-2 py-2.5">
              <Plus className="w-4 h-4" />
              Create Invoice
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2 py-2.5">
              <List className="w-4 h-4" />
              Invoice List
            </TabsTrigger>
            <TabsTrigger value="paid" className="gap-2 py-2.5">
              <FileText className="w-4 h-4" />
              Paid Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">No invoices yet</TableCell></TableRow>
                  ) : invoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-slate-50/60">
                      <TableCell className="font-mono text-sm font-medium">{inv.invoice_number}</TableCell>
                      <TableCell className="font-medium">{inv.agency_name}</TableCell>
                      <TableCell className="text-sm text-slate-500">{inv.date_from} – {inv.date_to}</TableCell>
                      <TableCell className="text-sm text-slate-500">{inv.line_items?.length || 0}</TableCell>
                      <TableCell className="font-semibold">${(inv.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusColors[inv.status] || ""}`}>{inv.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FileText className="w-10 h-10 mb-3" />
              <p className="text-sm">Click "Create Invoice" to get started</p>
              <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Create Invoice
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="paid">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">No paid invoices</TableCell></TableRow>
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
