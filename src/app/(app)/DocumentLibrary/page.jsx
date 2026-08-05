"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Trash2, Eye, ToggleLeft, ToggleRight, Pencil } from "lucide-react";

export default function DocumentLibrary() {
  const documents = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Library</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage documents therapists can attach to visit notes</p>
        </div>
        <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Add Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No documents yet. Add your first document above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className={`transition-opacity ${doc.is_active ? "" : "opacity-60"}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{doc.name}</span>
                    {doc.category && <Badge variant="outline" className="text-xs">{doc.category}</Badge>}
                    <Badge variant={doc.is_active ? "default" : "secondary"} className={`text-xs ${doc.is_active ? "bg-green-100 text-green-700 border-green-200" : ""}`}>
                      {doc.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {doc.description && <p className="text-sm text-slate-500 mt-0.5 truncate">{doc.description}</p>}
                  {doc.file_name && <p className="text-xs text-slate-400 mt-0.5">{doc.file_name}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" title="View">
                    <Eye className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Toggle">
                    {doc.is_active ? <ToggleRight className="w-5 h-5 text-teal-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit">
                    <Pencil className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
