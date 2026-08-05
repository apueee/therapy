"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Phone, Mail, MapPin, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function CompanyInformation() {
  const [isEditing, setIsEditing] = useState(false);
  const companyInfo = null;

  if (!companyInfo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Information</h1>
            <p className="text-slate-500 text-sm mt-1">Your practice details</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-2">No company information set up yet</p>
            <p className="text-sm text-slate-400 mb-4">Add your practice details to customize the system</p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Edit className="w-4 h-4 mr-2" /> Set Up Company Info
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Information</h1>
          <p className="text-slate-500 text-sm mt-1">Your practice details</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="bg-teal-600 hover:bg-teal-700 gap-2">
            <Edit className="w-4 h-4" /> Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" /> Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-slate-500">Company Name</Label>
              <p className="text-sm font-medium text-slate-800 mt-1">{companyInfo?.company_name || "—"}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">NPI Number</Label>
              <p className="text-sm text-slate-800 mt-1">{companyInfo?.npi || "—"}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Tax ID</Label>
              <p className="text-sm text-slate-800 mt-1">{companyInfo?.tax_id || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" /> Contact & Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</Label>
              <p className="text-sm text-slate-800 mt-1">{companyInfo?.phone || "—"}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
              <p className="text-sm text-slate-800 mt-1">{companyInfo?.email || "—"}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Address</Label>
              <p className="text-sm text-slate-800 mt-1">{companyInfo?.address || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
