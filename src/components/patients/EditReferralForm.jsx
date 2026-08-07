"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit, X } from "lucide-react";

export default function EditReferralForm({ onUpdate, preselectedPatientId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const agencies = [];
  const patients = [];

  React.useEffect(() => {
    if (preselectedPatientId && patients.length > 0 && !selectedPatient) {
      const p = patients.find(pt => pt.id === preselectedPatientId);
      if (p) selectPatient(p);
    }
  }, [preselectedPatientId, patients]);

  const filteredPatients = searchQuery
    ? patients.filter((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleTherapyType = (type) => {
    setForm((p) => ({
      ...p,
      therapy_types: p.therapy_types.includes(type)
        ? p.therapy_types.filter((t) => t !== type)
        : [...p.therapy_types, type],
    }));
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setForm({
      first_name: patient.first_name || "",
      last_name: patient.last_name || "",
      date_of_birth: patient.date_of_birth || "",
      phone: patient.phone || "",
      diagnosis: patient.diagnosis || "",
      therapy_types: patient.therapy_types || [],
      insurance: patient.insurance || "",
      agency: patient.agency || "",
      city: patient.city || "",
      cert_period_start: patient.cert_period_start || "",
      cert_period_end: patient.cert_period_end || "",
      authorization_number: patient.authorization_number || "",
      authorized_visits: patient.authorized_visits || "",
      pt_eval_visits: patient.pt_eval_visits || "",
      pt_treatment_visits: patient.pt_treatment_visits || "",
      ot_eval_visits: patient.ot_eval_visits || "",
      ot_treatment_visits: patient.ot_treatment_visits || "",
      st_eval_visits: patient.st_eval_visits || "",
      st_treatment_visits: patient.st_treatment_visits || "",
      notes: patient.notes || "",
    });
    setSearchQuery("");
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(selectedPatient.id, form);
    setSaving(false);
    setSelectedPatient(null);
    setForm(null);
  };

  const handleCancel = () => {
    setSelectedPatient(null);
    setForm(null);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {!selectedPatient ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-600" />
              Search Referral to Edit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Search Patient</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type patient name..."
                className="mt-2"
              />
            </div>
            {searchQuery && filteredPatients.length > 0 && (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => selectPatient(patient)}
                    className="w-full text-left px-4 py-3 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          {patient.date_of_birth && `DOB: ${patient.date_of_birth}`}
                          {patient.agency && ` • ${patient.agency}`}
                          {patient.authorization_number && ` • Auth: ${patient.authorization_number}`}
                        </div>
                      </div>
                      <Edit className="w-4 h-4 text-teal-600" />
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchQuery && filteredPatients.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-8">No patients found</div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-teal-600" />
                Edit Referral - {form.first_name} {form.last_name}
              </div>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => set("date_of_birth", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Primary Diagnosis</Label>
                <Input
                  value={form.diagnosis}
                  onChange={(e) => set("diagnosis", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Insurance</Label>
                <Input
                  value={form.insurance}
                  onChange={(e) => set("insurance", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Therapy Types</Label>
              <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.therapy_types.includes("Physical Therapy")}
                    onCheckedChange={() => toggleTherapyType("Physical Therapy")}
                  />
                  <span className="text-sm">Physical Therapy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.therapy_types.includes("Occupational Therapy")}
                    onCheckedChange={() => toggleTherapyType("Occupational Therapy")}
                  />
                  <span className="text-sm">Occupational Therapy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.therapy_types.includes("Speech Therapy")}
                    onCheckedChange={() => toggleTherapyType("Speech Therapy")}
                  />
                  <span className="text-sm">Speech Therapy</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-slate-50">
              <Label className="text-base font-semibold">Therapy Orders</Label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <Label>PT Eval Visits</Label>
                  <Input
                    type="number"
                    value={form.pt_eval_visits}
                    onChange={(e) => set("pt_eval_visits", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>PT Treatment Visits</Label>
                  <Input
                    type="number"
                    value={form.pt_treatment_visits}
                    onChange={(e) => set("pt_treatment_visits", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>OT Eval Visits</Label>
                  <Input
                    type="number"
                    value={form.ot_eval_visits}
                    onChange={(e) => set("ot_eval_visits", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>OT Treatment Visits</Label>
                  <Input
                    type="number"
                    value={form.ot_treatment_visits}
                    onChange={(e) => set("ot_treatment_visits", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>ST Eval Visits</Label>
                  <Input
                    type="number"
                    value={form.st_eval_visits}
                    onChange={(e) => set("st_eval_visits", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>ST Treatment Visits</Label>
                  <Input
                    type="number"
                    value={form.st_treatment_visits}
                    onChange={(e) => set("st_treatment_visits", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Agency</Label>
              <Select value={form.agency} onValueChange={(v) => set("agency", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select agency" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.map((a) => (
                    <SelectItem key={a.id} value={a.name}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cert Period Start</Label>
                <Input
                  type="date"
                  value={form.cert_period_start}
                  onChange={(e) => set("cert_period_start", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Cert Period End</Label>
                <Input
                  type="date"
                  value={form.cert_period_end}
                  onChange={(e) => set("cert_period_end", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Authorization Number</Label>
                <Input
                  value={form.authorization_number}
                  onChange={(e) => set("authorization_number", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Authorized Visits</Label>
                <Input
                  type="number"
                  value={form.authorized_visits}
                  onChange={(e) => set("authorized_visits", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Additional notes..."
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
