"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "@/components/layout/UserContext";
import { getPatientVisits } from "@/app/(app)/VisitNotes/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, CheckCircle, PenLine, FileUp, FileCheck, ChevronRight, ChevronLeft, MapPin } from "lucide-react";
import SignatureCapture from "./SignatureCapture";
import { DictationTextarea } from "./DictationButton";
import VisualAnalogueScale from "./VisualAnalogueScale";
import AgencyDocumentsSection from "./AgencyDocumentsSection";
import TherapyOrdersSection from "./TherapyOrdersSection";
import ROMEvaluationSection from "./ROMEvaluationSection";
import StrengthEvaluationSection from "./StrengthEvaluationSection";
import StandardizedTestForm from "./StandardizedTestForm";
import DischargeOasisSection from "./DischargeOasisSection";
import SLPObjectiveSection from "./SLPObjectiveSection";
import SLPADLSection from "./SLPADLSection";
import SLPSwallowSection from "./SLPSwallowSection";
import DoorPhotoCapture from "./DoorPhotoCapture";
import AdditionalUploads from "./AdditionalUploads";
import DCPlanEducationSection from "./DCPlanEducationSection";
import MobilitySection from "./MobilitySection";
import SignatureTab from "./SignatureTab";
import LibraryDocumentsPicker from "./LibraryDocumentsPicker";
import IADLSection from "./IADLSection";
import ReevalPlanTab from "./ReevalPlanTab";
import ReevalTab from "./ReevalTab";
import NomncTab from "./NomncTab";
import TreatmentRenderedSection from "./TreatmentRenderedSection";
import { format } from "date-fns";

const FUNCTIONAL_LEVELS = [
  { value: "independent", label: "Independent" },
  { value: "modified_independent", label: "Modified Independent" },
  { value: "supervision", label: "Supervision" },
  { value: "minimal_assist", label: "Minimal Assist" },
  { value: "moderate_assist", label: "Moderate Assist" },
  { value: "maximal_assist", label: "Maximal Assist" },
  { value: "dependent", label: "Dependent" },
];

const COMMON_CPT = ["97110", "97112", "97116", "97140", "97530", "97535", "97542", "97150", "97161", "97162", "97163", "92507", "92508", "92526"];

const ADL_COLS = ["NT", "I", "MI", "VC", "SBA", "CGA", "MinA", "ModA", "MaxA", "D"];
const ADL_ROWS = [
  "Grooming", "Toileting", "Bathing", "Laundry", "Shopping",
  "Transferring", "Housekeeping", "Transportation", "Feeding / Eating",
  "Ability to Use Phone", "Light Meal Preparation", "Ambulation / Locomotion",
  "Ability to Dress Lower Body", "Ability to Dress Upper Body",
];

const INTERVENTION_OPTIONS = [
  "Posture Training Exercises", "Gait Training", "L.E. ROM Exercises",
  "L.E. Positioning and Body Alignment Exercises", "U.E. ROM Exercises",
  "U.E. Positioning and Body Alignment Exercises", "Upper Body Strengthening Exercises",
  "Lower Body Strengthening Exercises", "Balance Exercises: Sitting", "Balance Exercises: Standing",
  "Endurance / Strength Exercises", "Joint Mobility Program", "Splint Care", "Prosthetic Device",
  "Adaptive Device", "Circulatory Checks as Applicable", "Bed Mobility", "Transfer Techniques",
  "Establish / Upgrade HEP", "Patient Education", "O2 Saturation Monitor",
  "Modalities for Pain Control", "Home Safety Training", "Stair / Step Training",
];

function getTabsForVisitType(visitType, agencyDocsOnly = false, therapyType = "", addOns = {}) {
  if (agencyDocsOnly) return ["Intake", "Signature"];
  if (visitType === "evaluation") {
    const mobilityTab = therapyType === "Occupational Therapy" ? "Function" : therapyType === "Speech Therapy" ? "Swallow" : "Mobility";
    const tabs = ["Intake", "Vitals", "Subjective", "Objective", "ADL's", mobilityTab, "Assessment", "Goals & Plan", "DC Plan & Edu"];
    if (addOns.nomnc) tabs.push("NOMNC");
    tabs.push("Signature");
    return tabs;
  } else if (visitType === "treatment") {
    const tabs = ["Intake", "Vitals", "SOAP Note", "Treatment Rendered", "Goals"];
    if (addOns.nomnc) tabs.push("NOMNC");
    tabs.push("Signature");
    return tabs;
  } else if (visitType === "re_evaluation") {
    const tabs = ["Intake", "Vitals", "Re-Evaluation", "Treatment Rendered", "Goals", "Plan"];
    if (addOns.nomnc) tabs.push("NOMNC");
    tabs.push("Signature");
    return tabs;
  } else if (visitType === "recertification") {
    const tabs = ["Intake", "Vitals", "Re-Evaluation", "Treatment Rendered", "Goals", "Plan"];
    if (addOns.nomnc) tabs.push("NOMNC");
    tabs.push("Signature");
    return tabs;
  } else if (visitType === "discharge_with_visit") {
    const tabs = ["Intake", "Vitals", "Treatment Rendered", "Discharge"];
    if (addOns.nomnc) tabs.push("NOMNC");
    tabs.push("Signature");
    return tabs;
  } else if (visitType === "discharge_without_visit") {
    const tabs = ["Intake", "Discharge"];
    if (addOns.nomnc) tabs.push("NOMNC");
    tabs.push("Signature");
    return tabs;
  } else if (visitType === "eval_refused" || visitType === "missed_visit") {
    return ["Intake", "Notes", "Signature"];
  }
  return ["Intake", "Vitals", "Notes", "Signature"];
}

function GoalInterventionInput({ interventions, onAdd, onRemove }) {
  const [input, setInput] = useState("");
  return (
    <div>
      <div className="flex gap-2 mt-1">
        <Input placeholder="Enter planned intervention…" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(input); setInput(""); } }} />
        <Button type="button" size="icon" variant="outline" onClick={() => { onAdd(input); setInput(""); }}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {interventions.map((g, i) => (
          <Badge key={i} variant="secondary" className="gap-1 pr-1">
            {g}<button type="button" onClick={() => onRemove(i)}><X className="w-3 h-3" /></button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function VisitNoteForm({ patients = [], therapists = [], agencies = [], onSave, onAutoSave, initial }) {
  const effectiveUser = useCurrentUser();
  const isAdmin = ["admin", "superuser"].includes(effectiveUser?.role) || ["admin", "superuser"].includes(effectiveUser?.user_type);

  const [form, setForm] = useState(initial ? {
    eval_treatment_goals: [{ goal: "", interventions: [], functional_status: "" }],
    medical_diagnoses: [],
    treatment_diagnoses: [],
    ...initial,
  } : {
    patient_id: "", therapist_id: "", visit_date: new Date().toISOString().split("T")[0],
    time_in: "", time_out: "", punch_in_reason: "", punch_out_reason: "",
    therapy_type: "", agency: "", visit_type: "treatment", duration_minutes: 0,
    cpt_codes: [], subjective: "", objective: "", assessment: "", plan: "",
    medical_history: "", prior_function: "", living_environment: "",
    rom_evaluation: {}, strength_evaluation: {},
    gait_analysis: "", standardized_testing: "", standardized_tests: [],
    medical_diagnoses: [], treatment_diagnoses: [],
    goals_addressed: [], interventions: [], patient_response: "", functional_status: "",
    eval_treatment_goals: [{ goal: "", interventions: [], functional_status: "" }],
    status: "draft",
    vitals: { blood_pressure: "", heart_rate: "", respiratory_rate: "", temperature: "", oxygen_saturation: "", pain_level: "" },
  });

  const [activeTab, setActiveTab] = useState("Intake");

  const patientAgencyName = form.agency || patients.find((p) => p.id === form.patient_id)?.agency;
  const patientAgencyRecord = agencies.find((a) => a.name === patientAgencyName);
  const agencyDocsOnly = patientAgencyRecord?.document_mode === "agency_docs";

  const addOns = {
    soc_oasis: !!form.include_soc_oasis,
    roc_oasis: !!form.include_roc_oasis,
    discharge_oasis: !!form.require_discharge_oasis,
    nomnc: !!form.include_nomnc,
  };

  const tabs = getTabsForVisitType(form.visit_type, agencyDocsOnly, form.therapy_type, addOns);

  useEffect(() => {
    const newTabs = getTabsForVisitType(form.visit_type, agencyDocsOnly, form.therapy_type, addOns);
    if (!newTabs.includes(activeTab)) setActiveTab("Intake");
  }, [form.visit_type, agencyDocsOnly, form.include_nomnc]);

  const [patientVisits, setPatientVisits] = useState([]);

  useEffect(() => {
    if (form.patient_id) {
      getPatientVisits(form.patient_id).then(setPatientVisits).catch(() => {});
    } else {
      setPatientVisits([]);
    }
  }, [form.patient_id]);

  const [saving, setSaving] = useState(false);
  const [punchingIn, setPunchingIn] = useState(false);
  const [unableToPunchIn, setUnableToPunchIn] = useState(false);
  const [manualTimeIn, setManualTimeIn] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [interventionInput, setInterventionInput] = useState("");
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [icd10Input, setIcd10Input] = useState("");
  const [treatmentDiagnosisInput, setTreatmentDiagnosisInput] = useState("");
  const [treatmentIcd10Input, setTreatmentIcd10Input] = useState("");
  const [uploadingPDF, setUploadingPDF] = useState(false);

  const PTA_COTA_CREDENTIALS = ["PTA", "COTA"];
  const selectedTherapistCredentials = therapists.find((t) => t.id === form.therapist_id)?.credentials?.trim().toUpperCase();
  const isAssistant = PTA_COTA_CREDENTIALS.includes(selectedTherapistCredentials);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleCpt = (code) => {
    const arr = form.cpt_codes || [];
    set("cpt_codes", arr.includes(code) ? arr.filter((c) => c !== code) : [...arr, code]);
  };

  const addGoal = () => { if (!goalInput.trim()) return; set("goals_addressed", [...(form.goals_addressed || []), goalInput.trim()]); setGoalInput(""); };
  const addIntervention = () => { if (!interventionInput.trim()) return; set("interventions", [...(form.interventions || []), interventionInput.trim()]); setInterventionInput(""); };
  const addDiagnosis = () => {
    if (!diagnosisInput.trim()) return;
    set("medical_diagnoses", [...(form.medical_diagnoses || []), { diagnosis: diagnosisInput.trim(), icd10_code: icd10Input.trim() }]);
    setDiagnosisInput(""); setIcd10Input("");
  };
  const addTreatmentDiagnosis = () => {
    if (!treatmentDiagnosisInput.trim()) return;
    set("treatment_diagnoses", [...(form.treatment_diagnoses || []), { diagnosis: treatmentDiagnosisInput.trim(), icd10_code: treatmentIcd10Input.trim() }]);
    setTreatmentDiagnosisInput(""); setTreatmentIcd10Input("");
  };

  const selectedPatient = patients.find((p) => p.id === form.patient_id);
  const selectedTherapist = therapists.find((t) => t.id === form.therapist_id);

  useEffect(() => {
    if (form.patient_id && !form.agency && selectedPatient?.agency) set("agency", selectedPatient.agency);
  }, [form.patient_id, selectedPatient?.agency]);

  useEffect(() => {
    if (isAssistant && form.visit_type !== "treatment") set("visit_type", "treatment");
  }, [isAssistant]);

  useEffect(() => {
    if (!form.patient_id || !form.therapy_type || initial) return;
    const priorVisits = patientVisits.filter(v => v.therapy_type === form.therapy_type && (v.status === "completed" || v.status === "signed"));
    if (priorVisits.length === 0) set("visit_type", "evaluation");
    else if (form.visit_type === "evaluation") set("visit_type", "treatment");
  }, [form.patient_id, form.therapy_type, patientVisits.length]);

  const handleSave = async (status) => {
    const isLocked = form.status === "completed" || form.status === "signed";
    if (isLocked && !isAdmin) { alert("This visit note is locked. Only administrators can unlock it for editing."); return; }
    setSaving(true);
    const cleanedVitals = form.vitals ? {
      blood_pressure: form.vitals.blood_pressure || null,
      heart_rate: form.vitals.heart_rate === "" ? null : form.vitals.heart_rate,
      respiratory_rate: form.vitals.respiratory_rate === "" ? null : form.vitals.respiratory_rate,
      temperature: form.vitals.temperature === "" ? null : form.vitals.temperature,
      oxygen_saturation: form.vitals.oxygen_saturation === "" ? null : form.vitals.oxygen_saturation,
      pain_level: form.vitals.pain_level === "" ? null : form.vitals.pain_level,
    } : null;
    const data = {
      ...form, vitals: cleanedVitals, status,
      patient_name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "",
      therapist_name: selectedTherapist?.full_name || "",
      agency: form.agency || selectedPatient?.agency || "",
    };
    if (onSave) await onSave(data);
    setSaving(false);
  };

  const currentTabIndex = tabs.indexOf(activeTab);
  const goNext = async () => {
    if (currentTabErrors.length > 0) return;
    if (currentTabIndex < tabs.length - 1) { autoSaveCurrentForm(); setActiveTab(tabs[currentTabIndex + 1]); }
  };
  const goPrev = () => { if (currentTabIndex > 0) setActiveTab(tabs[currentTabIndex - 1]); };

  const autoSaveCurrentForm = () => {
    if (!form.patient_id || !form.therapist_id) return;
    const cleanedVitals = form.vitals ? {
      blood_pressure: form.vitals.blood_pressure || null,
      heart_rate: form.vitals.heart_rate === "" ? null : form.vitals.heart_rate,
      respiratory_rate: form.vitals.respiratory_rate === "" ? null : form.vitals.respiratory_rate,
      temperature: form.vitals.temperature === "" ? null : form.vitals.temperature,
      oxygen_saturation: form.vitals.oxygen_saturation === "" ? null : form.vitals.oxygen_saturation,
      pain_level: form.vitals.pain_level === "" ? null : form.vitals.pain_level,
    } : null;
    const data = {
      ...form, vitals: cleanedVitals, status: form.status === "signed" ? "signed" : "draft",
      patient_name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "",
      therapist_name: selectedTherapist?.full_name || "",
      agency: form.agency || selectedPatient?.agency || "",
    };
    const autoSaveFn = onAutoSave || onSave;
    if (autoSaveFn) autoSaveFn(data).catch(() => {});
  };

  const TabBar = () => (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm -mx-0 mb-6">
      <div className="flex overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button key={tab} type="button"
            onClick={() => { if (tab !== activeTab) autoSaveCurrentForm(); setActiveTab(tab); }}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? "border-teal-600 text-teal-700 bg-teal-50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
          >
            <span className="mr-1.5 text-xs text-slate-400">{idx + 1}.</span>{tab}
          </button>
        ))}
      </div>
    </div>
  );

  const getTabErrors = (tab) => {
    const errors = [];
    if (tab === "Intake") {
      if (!form.patient_id) errors.push("Patient is required");
      if (!form.therapist_id) errors.push("Therapist is required");
      if (!form.visit_date) errors.push("Visit Date is required");
      if (!form.therapy_type) errors.push("Therapy Type is required");
      if (!form.time_in) errors.push("Punch In (Time In) is required");
      const hasPatientId = Object.values(form.patient_identification || {}).some(Boolean);
      if (!hasPatientId) errors.push("At least one Patient Identification method is required");
    }
    if (tab === "Vitals") {
      const vitalsSkipped = !!(form.vitals_not_taken_reason || "").trim();
      const hasVitals = form.vitals && (form.vitals.blood_pressure || form.vitals.heart_rate || form.vitals.respiratory_rate || form.vitals.temperature || form.vitals.oxygen_saturation);
      if (!vitalsSkipped && !hasVitals) errors.push("Vital signs are required — enter at least one value or provide a reason for not taking vitals");
    }
    if (tab === "Subjective" && form.visit_type === "evaluation") {
      const req = (v) => (v || "").trim().length >= 2;
      if (!req(form.medical_history)) errors.push("Medical History is required");
      if (!req(form.past_surgical_history)) errors.push("Past Surgical History is required");
      if (!req(form.subjective)) errors.push("Reason for Referral is required");
      if (!req(form.prior_function)) errors.push("Prior Level of Function is required");
      if (!req(form.living_environment)) errors.push("Living Environment is required");
      if (form.therapy_type === "Physical Therapy" || form.therapy_type === "Occupational Therapy") {
        const homeboundCount = (form.homebound_reasons || []).length + (form.homebound_other !== undefined && form.homebound_other !== null ? 1 : 0);
        if (homeboundCount < 2) errors.push("Homebound Reason requires at least 2 options");
      }
      if (!req(form.therapy_objective_patient_goals)) errors.push("Patient / Caregiver Goals is required");
      if (!req(form.precautions)) errors.push("Precautions is required");
      if (!req(form.medication_changes)) errors.push("Medication Changes is required");
    }
    if (tab === "DC Plan & Edu" && form.visit_type === "evaluation") {
      if (!((form.dc_plan || {}).discharge_setting || "").trim()) errors.push("Anticipated Discharge Setting is required");
      if (!((form.dc_plan || {}).discharge_criteria || "").trim()) errors.push("Discharge Criteria is required");
      const eduTopics = (form.patient_education || {}).topics || [];
      const hasOtherTopic = (form.patient_education || {}).other_checked && ((form.patient_education || {}).other_topic || "").trim();
      if (eduTopics.length === 0 && !hasOtherTopic) errors.push("At least one Patient Education Topic is required");
      const educatedTo = (form.patient_education || {}).educated_to || [];
      if (educatedTo.length === 0) errors.push("Educated To is required");
      if (!((form.patient_education || {}).response || "").trim()) errors.push("Patient / Caregiver Response is required");
      if (!((form.dc_plan || {}).treatment_performed || "").trim()) errors.push("Treatment Performed This Visit is required");
      if (!((form.dc_plan || {}).rehab_potential || "").trim()) errors.push("Rehabilitation Potential is required");
    }
    if (tab === "Signature") {
      if (!form.therapist_signature) errors.push("Therapist Signature is required");
      const patientSigOk = form.patient_signature || (form.patient_signature_unable && (form.patient_signature_unable_reason || "").trim());
      if (!patientSigOk) {
        if (form.patient_signature_unable) errors.push("Reason for unable to capture patient signature is required");
        else errors.push("Patient Signature is required");
      }
    }
    if (tab === "Goals & Plan" && form.visit_type === "evaluation") {
      const goals = form.eval_treatment_goals || [];
      const hasValidGoal = goals.some(g => (g.goal || "").trim().length > 0);
      if (!hasValidGoal) errors.push("At least one Treatment Goal is required");
      if ((form.therapy_orders || {}).eval_only && !((form.therapy_orders || {}).eval_only_reason || "").trim()) errors.push("Eval Only reason is required");
      if (!form.plan?.trim()) errors.push("Skilled Service Narrative is required");
      const cc = form.care_coordination || {};
      const hasDisciplines = (cc.disciplines || []).length > 0 || (cc.other || "").trim();
      if (!hasDisciplines) errors.push("Care Coordination: select at least one discipline");
      if (!(cc.reason || "").trim()) errors.push("Care Coordination Reason is required");
    }
    return errors;
  };

  const currentTabErrors = getTabErrors(activeTab);

  const evalMissingFields = form.visit_type === "evaluation" ? (() => {
    const missing = [];
    const goals = form.eval_treatment_goals || [];
    if (!goals.some(g => (g.goal || "").trim().length > 0)) missing.push("At least one Treatment Goal");
    if (!form.plan?.trim()) missing.push("Need for Skilled Services (narrative)");
    const cc = form.care_coordination || {};
    if (!((cc.disciplines || []).length > 0 || (cc.other || "").trim())) missing.push("Care Coordination");
    if (!(cc.reason || "").trim()) missing.push("Care Coordination Reason");
    return missing;
  })() : [];

  const NavButtons = () => (
    <div className="flex flex-col gap-2 pt-2 pb-4">
      {currentTabErrors.length > 0 && currentTabIndex < tabs.length - 1 && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="font-semibold mb-1">Complete required fields to continue:</p>
          <ul className="list-disc list-inside space-y-0.5">{currentTabErrors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" onClick={goPrev} disabled={currentTabIndex === 0} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        {currentTabIndex < tabs.length - 1 ? (
          <Button type="button" onClick={goNext} disabled={currentTabErrors.length > 0} className={`gap-2 ${currentTabErrors.length > 0 ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"}`}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-2">
            {evalMissingFields.length > 0 && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-xs text-right">
                <p className="font-semibold mb-1">Required to complete:</p>
                <ul className="list-disc list-inside space-y-0.5">{evalMissingFields.map((f) => <li key={f}>{f}</li>)}</ul>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => handleSave("draft")} disabled={saving || !form.patient_id || !form.therapist_id}>
                <Save className="w-4 h-4 mr-2" />Save Draft
              </Button>
              <Button size="lg" onClick={() => handleSave("completed")} disabled={saving || !form.patient_id || !form.therapist_id || evalMissingFields.length > 0} className="bg-teal-600 hover:bg-teal-700">
                <CheckCircle className="w-4 h-4 mr-2" />Complete & Sign
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-6xl">
      <TabBar />

      {/* INTAKE */}
      {activeTab === "Intake" && (
        <div className="space-y-6">
          {agencyDocsOnly && (
            <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <FileUp className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
              <div>
                <p className="font-semibold">Agency Docs Mode — {patientAgencyName}</p>
                <p className="text-xs text-blue-600 mt-0.5">This agency uses their own documentation. Only Intake and Signature tabs are shown.</p>
              </div>
            </div>
          )}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Visit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Patient <span className="text-red-500">★</span></Label>
                  <Select value={form.patient_id} onValueChange={(v) => { set("patient_id", v); const p = patients.find((x) => x.id === v); if (p?.agency) set("agency", p.agency); }}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Therapist <span className="text-red-500">★</span></Label>
                  <Select value={form.therapist_id} onValueChange={(v) => { set("therapist_id", v); const t = therapists.find((x) => x.id === v); if (t?.discipline) set("therapy_type", t.discipline); }}>
                    <SelectTrigger><SelectValue placeholder="Select therapist" /></SelectTrigger>
                    <SelectContent>{therapists.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name} ({t.credentials || t.discipline})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Visit Date <span className="text-red-500">★</span></Label>
                  <Input type="date" value={form.visit_date} onChange={(e) => set("visit_date", e.target.value)} />
                </div>
                <div>
                  <Label>Therapy Type <span className="text-red-500">★</span></Label>
                  <Select value={form.therapy_type} onValueChange={(v) => set("therapy_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                      <SelectItem value="Occupational Therapy">Occupational Therapy</SelectItem>
                      <SelectItem value="Speech Therapy">Speech Therapy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Visit Type</Label>
                  {isAssistant ? (
                    <div className="space-y-1">
                      <div className="flex h-9 w-full items-center rounded-md border border-input bg-slate-50 px-3 py-1 text-sm text-slate-600">Treatment</div>
                      <p className="text-[11px] text-amber-600">PTA/COTA can only document treatment visits.</p>
                    </div>
                  ) : isAdmin ? (
                    <Select value={form.visit_type} onValueChange={(v) => set("visit_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="evaluation">Evaluation</SelectItem>
                        <SelectItem value="treatment">Treatment</SelectItem>
                        <SelectItem value="re_evaluation">Re-evaluation</SelectItem>
                        <SelectItem value="recertification">Recertification</SelectItem>
                        <SelectItem value="discharge_with_visit">Discharge with Visit</SelectItem>
                        <SelectItem value="discharge_without_visit">Discharge without Visit</SelectItem>
                        <SelectItem value="eval_refused">Eval Refused</SelectItem>
                        <SelectItem value="missed_visit">Missed Visit</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex h-9 w-full items-center rounded-md border border-input bg-slate-50 px-3 py-1 text-sm text-slate-600 capitalize">
                      {(form.visit_type || "treatment").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                  )}
                </div>
              </div>

              {!agencyDocsOnly && !isAssistant && (
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Additional Documentation</p>
                  <div className="flex flex-wrap gap-3">
                    {form.visit_type === "evaluation" && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!form.include_soc_oasis} onChange={(e) => set("include_soc_oasis", e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-teal-600 cursor-pointer" />
                        <span className="text-sm text-slate-700">SOC OASIS</span>
                      </label>
                    )}
                    {form.visit_type === "recertification" && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!form.include_roc_oasis} onChange={(e) => set("include_roc_oasis", e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-teal-600 cursor-pointer" />
                        <span className="text-sm text-slate-700">ROC OASIS</span>
                      </label>
                    )}
                    {(form.visit_type === "discharge_with_visit" || form.visit_type === "discharge_without_visit") && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!form.require_discharge_oasis} onChange={(e) => set("require_discharge_oasis", e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-teal-600 cursor-pointer" />
                        <span className="text-sm text-slate-700">Discharge OASIS</span>
                      </label>
                    )}
                    {form.visit_type !== "eval_refused" && form.visit_type !== "missed_visit" && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!form.include_nomnc} onChange={(e) => set("include_nomnc", e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-teal-600 cursor-pointer" />
                        <span className="text-sm text-slate-700">NOMNC</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="col-span-2 md:col-span-3">
                  <Label>Time In <span className="text-red-500">★</span></Label>
                  {form.time_in ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-md">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-teal-800">{form.time_in}</p>
                        {form.punch_in_location && (<p className="text-xs text-teal-600 truncate">{form.punch_in_location.lat.toFixed(5)}, {form.punch_in_location.lng.toFixed(5)}</p>)}
                        {form.punch_in_reason && (<p className="text-xs text-amber-600 mt-0.5">Unable to punch in: {form.punch_in_reason}</p>)}
                      </div>
                      <button type="button" onClick={() => { set("time_in", ""); set("punch_in_location", null); set("punch_in_reason", ""); setUnableToPunchIn(false); setManualTimeIn(""); }} className="text-teal-400 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" disabled={punchingIn} className="flex-1 gap-2 border-teal-300 text-teal-700 hover:bg-teal-50"
                          onClick={async () => {
                            setPunchingIn(true); setUnableToPunchIn(false);
                            const now = new Date(); const timeIn = now.toTimeString().slice(0, 5);
                            set("time_in", timeIn);
                            if (form.status === "scheduled") set("status", "draft");
                            if (timeIn && form.time_out) {
                              const [inH, inM] = timeIn.split(":").map(Number);
                              const [outH, outM] = form.time_out.split(":").map(Number);
                              const dur = (outH * 60 + outM) - (inH * 60 + inM);
                              if (dur > 0) set("duration_minutes", dur);
                            }
                            if (typeof navigator !== "undefined" && navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (pos) => { set("punch_in_location", { lat: pos.coords.latitude, lng: pos.coords.longitude }); setPunchingIn(false); },
                                () => { setPunchingIn(false); }
                              );
                            } else { setPunchingIn(false); }
                          }}>
                          <MapPin className="w-4 h-4" />{punchingIn ? "Getting location…" : "Punch In"}
                        </Button>
                        <Button type="button" variant="outline"
                          className={`flex-1 gap-2 ${unableToPunchIn ? "bg-amber-50 border-amber-400 text-amber-800" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
                          onClick={() => setUnableToPunchIn(!unableToPunchIn)}>
                          Unable to Punch In
                        </Button>
                      </div>
                      {unableToPunchIn && (
                        <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 space-y-3">
                          <p className="text-xs font-semibold text-amber-800">Reason <span className="text-red-500">★</span></p>
                          <Textarea placeholder="Describe why you were unable to punch in..." value={form.punch_in_reason || ""} onChange={(e) => set("punch_in_reason", e.target.value)} rows={2} className="text-sm bg-white" />
                          <div className="flex items-center gap-2">
                            <Input type="time" value={manualTimeIn} onChange={(e) => setManualTimeIn(e.target.value)} className="max-w-[140px] bg-white" />
                            <Button type="button" size="sm" disabled={!manualTimeIn || !(form.punch_in_reason || "").trim()} className="bg-amber-600 hover:bg-amber-700 text-white"
                              onClick={() => {
                                set("time_in", manualTimeIn);
                                if (form.status === "scheduled") set("status", "draft");
                                if (manualTimeIn && form.time_out) {
                                  const [inH, inM] = manualTimeIn.split(":").map(Number);
                                  const [outH, outM] = form.time_out.split(":").map(Number);
                                  const dur = (outH * 60 + outM) - (inH * 60 + inM);
                                  if (dur > 0) set("duration_minutes", dur);
                                }
                                setUnableToPunchIn(false);
                              }}>
                              Confirm Time
                            </Button>
                            {!!(manualTimeIn && !(form.punch_in_reason || "").trim()) && <span className="text-xs text-red-500">Enter a reason first</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {form.time_in && (
                <DoorPhotoCapture photoUrl={form.door_photo_url}
                  onPhotoSaved={(url) => { set("door_photo_url", url); }}
                  onRemove={() => set("door_photo_url", null)} />
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Time Out</Label>
                  {form.time_out ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{form.time_out}</p>
                        {form.punch_out_location && (<p className="text-xs text-slate-500 truncate">{form.punch_out_location.lat.toFixed(5)}, {form.punch_out_location.lng.toFixed(5)}</p>)}
                      </div>
                      <button type="button" onClick={() => { set("time_out", ""); set("punch_out_location", null); set("duration_minutes", ""); }} className="text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex h-9 w-full items-center rounded-md border border-dashed border-slate-200 px-3 text-xs text-slate-400">Punch out after signature</div>
                  )}
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Input type="number" value={form.duration_minutes || ""} readOnly className="bg-slate-50 text-slate-600" placeholder="Auto-calculated" />
                </div>
              </div>
              <div>
                <Label>Agency</Label>
                <div className="flex h-9 w-full items-center rounded-md border border-input bg-slate-50 px-3 py-1 text-sm text-slate-700">
                  {form.agency || <span className="text-slate-400">Auto-populated from patient record</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <button type="button" onClick={() => set("non_billable", !form.non_billable)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${form.non_billable ? "bg-red-500" : "bg-slate-300"}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.non_billable ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Non-Billable</p>
                    <p className="text-xs text-slate-500">Mark this visit as not billable</p>
                  </div>
                  {form.non_billable && <Badge className="ml-auto bg-red-100 text-red-700 border-red-200 text-xs">Non-Billable</Badge>}
                </div>
                <div>
                  <Label>Special Pricing Override</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-sm">$</span>
                    <Input type="number" min="0" step="0.01" placeholder="Leave blank for standard rate"
                      value={form.special_price ?? ""} onChange={(e) => set("special_price", e.target.value === "" ? null : parseFloat(e.target.value))} className="flex-1" />
                  </div>
                  {form.special_price != null && (<p className="text-xs text-amber-600 mt-1">Custom rate: ${parseFloat(form.special_price).toFixed(2)} — overrides standard billing</p>)}
                </div>
              </div>

              <div>
                <Label>Medical Diagnosis</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-[2fr_1fr_auto] gap-2">
                    <Input placeholder="Enter diagnosis..." value={diagnosisInput} onChange={(e) => setDiagnosisInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDiagnosis())} />
                    <Input placeholder="ICD-10 code" value={icd10Input} onChange={(e) => setIcd10Input(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDiagnosis())} />
                    <Button type="button" size="icon" variant="outline" onClick={addDiagnosis}><Plus className="w-4 h-4" /></Button>
                  </div>
                  {form.medical_diagnoses?.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {form.medical_diagnoses.map((d, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-md border bg-slate-50">
                          <span className="text-sm text-slate-700">{d.diagnosis} {d.icd10_code && <span className="text-slate-500">({d.icd10_code})</span>}</span>
                          <button type="button" onClick={() => set("medical_diagnoses", form.medical_diagnoses.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Treatment Diagnosis</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-[2fr_1fr_auto] gap-2">
                    <Input placeholder="Enter treatment diagnosis..." value={treatmentDiagnosisInput} onChange={(e) => setTreatmentDiagnosisInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTreatmentDiagnosis())} />
                    <Input placeholder="ICD-10 code" value={treatmentIcd10Input} onChange={(e) => setTreatmentIcd10Input(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTreatmentDiagnosis())} />
                    <Button type="button" size="icon" variant="outline" onClick={addTreatmentDiagnosis}><Plus className="w-4 h-4" /></Button>
                  </div>
                  {form.treatment_diagnoses?.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {form.treatment_diagnoses.map((d, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-md border bg-teal-50">
                          <span className="text-sm text-slate-700">{d.diagnosis} {d.icd10_code && <span className="text-slate-500">({d.icd10_code})</span>}</span>
                          <button type="button" onClick={() => set("treatment_diagnoses", form.treatment_diagnoses.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Patient Identification <span className="text-red-500 text-sm">★</span></CardTitle>
            </CardHeader>
            <CardContent>
              {!Object.values(form.patient_identification || {}).some(Boolean) && (<p className="text-xs text-red-500 mb-2">Select at least one identification method</p>)}
              <div className="space-y-2">
                {[
                  { key: "date_of_birth", label: "Date of Birth" }, { key: "address", label: "Address" },
                  { key: "facial_recognition", label: "Facial Recognition" }, { key: "family_member_verify", label: "Family Member Verify" },
                  { key: "ssn", label: "SSN#" },
                ].map(({ key, label }) => {
                  const checked = (form.patient_identification || {})[key] || false;
                  return (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={(e) => set("patient_identification", { ...(form.patient_identification || {}), [key]: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-teal-600 cursor-pointer" />
                      <span className="text-sm text-slate-700">{label}</span>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VITALS */}
      {activeTab === "Vitals" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-800">Vital Signs <span className="text-red-500 text-sm">★</span></CardTitle>
                <Button type="button" variant="outline" size="sm"
                  className={`gap-2 ${form.vitals_not_taken_reason !== undefined && form.vitals_not_taken_reason !== null ? "bg-orange-50 border-orange-400 text-orange-800" : "border-orange-300 text-orange-700 hover:bg-orange-50"}`}
                  onClick={() => { if (form.vitals_not_taken_reason !== undefined && form.vitals_not_taken_reason !== null) set("vitals_not_taken_reason", null); else set("vitals_not_taken_reason", ""); }}>
                  Vitals Not Taken
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.vitals_not_taken_reason !== undefined && form.vitals_not_taken_reason !== null ? (
                <div className="border border-orange-200 bg-orange-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-orange-800">Reason vitals were not taken <span className="text-red-500">★</span></p>
                  <DictationTextarea placeholder="e.g. Patient refused, equipment unavailable..." value={form.vitals_not_taken_reason || ""} onChange={(e) => set("vitals_not_taken_reason", e.target.value)} rows={2} className="text-sm bg-white" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><Label>Blood Pressure</Label><Input placeholder="120/80" value={form.vitals?.blood_pressure || ""} onChange={(e) => set("vitals", { ...form.vitals, blood_pressure: e.target.value })} /></div>
                  <div><Label>Heart Rate (bpm)</Label><Input type="number" placeholder="72" value={form.vitals?.heart_rate || ""} onChange={(e) => set("vitals", { ...form.vitals, heart_rate: e.target.value ? parseInt(e.target.value) : "" })} /></div>
                  <div><Label>Respiratory Rate (rpm)</Label><Input type="number" placeholder="16" value={form.vitals?.respiratory_rate || ""} onChange={(e) => set("vitals", { ...form.vitals, respiratory_rate: e.target.value ? parseInt(e.target.value) : "" })} /></div>
                  <div><Label>Temperature (F)</Label><Input type="number" step="0.1" placeholder="98.6" value={form.vitals?.temperature || ""} onChange={(e) => set("vitals", { ...form.vitals, temperature: e.target.value ? parseFloat(e.target.value) : "" })} /></div>
                  <div><Label>O2 Saturation (%)</Label><Input type="number" placeholder="98" value={form.vitals?.oxygen_saturation || ""} onChange={(e) => set("vitals", { ...form.vitals, oxygen_saturation: e.target.value ? parseInt(e.target.value) : "" })} /></div>
                </div>
              )}
            </CardContent>
          </Card>

          <VisualAnalogueScale value={form.vas_pain_score ?? ""} onChange={(v) => set("vas_pain_score", v)} painLocation={form.pain_location || ""} onPainLocationChange={(v) => set("pain_location", v)} />

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Frequency of Pain interfering with activity or movement</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["No pain or pain does not interfere with activity or movement.", "Less often than daily.", "Daily, but not constantly.", "All of the time."].map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="pain_frequency" value={option} checked={form.pain_frequency === option} onChange={() => set("pain_frequency", option)} className="w-4 h-4 text-teal-600 cursor-pointer" />
                    <span className="text-sm text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {form.visit_type === "evaluation" && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-blue-700">Pain Management Effectiveness</CardTitle></CardHeader>
              <CardContent>
                <div className="relative">
                  <DictationTextarea placeholder="" maxLength={100} value={form.pain_management_effectiveness || ""} onChange={(e) => set("pain_management_effectiveness", e.target.value)} rows={3} />
                  <span className="absolute right-2 bottom-2 text-xs text-amber-600">of 100</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* SUBJECTIVE (evaluation) */}
      {activeTab === "Subjective" && form.visit_type === "evaluation" && (
        <div className="space-y-6">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Subjective</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="text-blue-700 font-semibold">Medical History <span className="text-red-500">★</span></Label><DictationTextarea placeholder="Relevant medical history..." value={form.medical_history || ""} onChange={(e) => set("medical_history", e.target.value)} rows={2} className={(form.medical_history || "").trim().length < 2 ? "border-red-300" : ""} /></div>
              <div><Label className="text-blue-700 font-semibold">Past Surgical History <span className="text-red-500">★</span></Label><DictationTextarea placeholder="Previous surgeries..." value={form.past_surgical_history || ""} onChange={(e) => set("past_surgical_history", e.target.value)} rows={2} className={(form.past_surgical_history || "").trim().length < 2 ? "border-red-300" : ""} /></div>
              <div><Label className="text-blue-700 font-semibold">Reason for Referral <span className="text-red-500">★</span></Label><DictationTextarea placeholder="Chief complaint..." value={form.subjective || ""} onChange={(e) => set("subjective", e.target.value)} rows={2} className={(form.subjective || "").trim().length < 2 ? "border-red-300" : ""} /></div>
              <div><Label className="text-blue-700 font-semibold">Prior Level of Function <span className="text-red-500">★</span></Label><DictationTextarea placeholder="Functional abilities prior..." value={form.prior_function || ""} onChange={(e) => set("prior_function", e.target.value)} rows={2} className={(form.prior_function || "").trim().length < 2 ? "border-red-300" : ""} /></div>
              <div><Label className="text-blue-700 font-semibold">Living Environment <span className="text-red-500">★</span></Label><DictationTextarea placeholder="Home setup, stairs..." value={form.living_environment || ""} onChange={(e) => set("living_environment", e.target.value)} rows={2} className={(form.living_environment || "").trim().length < 2 ? "border-red-300" : ""} /></div>

              {(form.therapy_type === "Physical Therapy" || form.therapy_type === "Occupational Therapy") && (
                <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
                  <h4 className="font-semibold text-slate-800">Homebound <span className="text-red-500">★</span></h4>
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">Homebound Reason</p>
                    <div className="space-y-2">
                      {["Medical Restriction", "Needs assistance for all activities", "Residual Weakness", "Severe SOB, SOB upon exertion", "Confusion, unable to go out of home alone", "Dependent upon adaptive devices", "Requires assistance to ambulate", "Unable to safely leave home unassisted", "Not Homebound"].map((reason) => {
                        const checked = (form.homebound_reasons || []).includes(reason);
                        return (
                          <label key={reason} className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={checked} onChange={(e) => { const current = form.homebound_reasons || []; set("homebound_reasons", e.target.checked ? [...current, reason] : current.filter((r) => r !== reason)); }} className="w-4 h-4 rounded border-slate-300 text-teal-600 cursor-pointer" />
                            <span className="text-sm text-slate-700">{reason}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div><Label className="text-blue-700 font-semibold">Patient / Caregiver Goals <span className="text-red-500">★</span></Label><DictationTextarea placeholder="Goals expressed..." value={form.therapy_objective_patient_goals || ""} onChange={(e) => set("therapy_objective_patient_goals", e.target.value)} rows={3} className={(form.therapy_objective_patient_goals || "").trim().length < 2 ? "border-red-300" : ""} /></div>
              <div><Label className="text-blue-700 font-semibold">Precautions <span className="text-red-500">★</span></Label><DictationTextarea placeholder="Weight bearing status..." value={form.precautions || ""} onChange={(e) => set("precautions", e.target.value)} rows={3} className={(form.precautions || "").trim().length < 2 ? "border-red-300" : ""} /></div>
              <div><Label className="text-blue-700 font-semibold">Medication Changes <span className="text-red-500">★</span></Label><DictationTextarea placeholder="Recent medication changes..." value={form.medication_changes || ""} onChange={(e) => set("medication_changes", e.target.value)} rows={3} className={(form.medication_changes || "").trim().length < 2 ? "border-red-300" : ""} /></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* OBJECTIVE (evaluation) */}
      {activeTab === "Objective" && form.visit_type === "evaluation" && (
        <div className="space-y-6">
          {form.therapy_type === "Speech Therapy" ? (
            <SLPObjectiveSection slpObjective={form.slp_objective || {}} onChange={(v) => set("slp_objective", v)} />
          ) : (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Objective</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div><Label className="text-blue-700 font-semibold mb-3 block">ROM Evaluation</Label><ROMEvaluationSection romEvaluation={form.rom_evaluation || {}} onChange={(v) => set("rom_evaluation", v)} /></div>
              <div className="border-t pt-4"><Label className="text-blue-700 font-semibold mb-3 block">Strength Evaluation</Label><StrengthEvaluationSection strengthEvaluation={form.strength_evaluation || {}} onChange={(v) => set("strength_evaluation", v)} /></div>
              <div className="border-t pt-4">
                <Label className="text-blue-700 font-semibold mb-3 block">Other</Label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-100 border-b"><th className="text-left px-4 py-2 font-semibold text-slate-700 w-40">Category</th><th className="text-left px-4 py-2 font-semibold text-slate-700 w-32">Status</th><th className="text-left px-4 py-2 font-semibold text-slate-700">Notes</th></tr></thead>
                    <tbody>
                      {[{ label: "Neurological", key: "neurological" }, { label: "Sensation", key: "sensation" }, { label: "Skin Condition", key: "skin_condition" }, { label: "Edema", key: "edema" }].map(({ label, key }, i) => {
                        const otherData = form.other_findings || {};
                        const isWnl = otherData[key + "_wnl"] !== false;
                        const notes = otherData[key + "_notes"] || "";
                        return (
                          <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            <td className="px-4 py-3 font-medium text-teal-700">{label}</td>
                            <td className="px-4 py-3">
                              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isWnl} onChange={(e) => set("other_findings", { ...otherData, [key + "_wnl"]: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-teal-600 cursor-pointer" /><span className="text-sm text-slate-700">WNL</span></label>
                            </td>
                            <td className="px-4 py-3"><input type="text" maxLength={100} value={notes} onChange={(e) => set("other_findings", { ...otherData, [key + "_notes"]: e.target.value })} className="w-full h-8 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      )}

      {/* ADLs (evaluation) */}
      {activeTab === "ADL's" && form.visit_type === "evaluation" && (
        <div className="space-y-6">
          {form.therapy_type === "Speech Therapy" ? (
            <SLPADLSection slpAdl={form.slp_adl || {}} onChange={(v) => set("slp_adl", v)} />
          ) : (
            <>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Activities of Daily Living</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead><tr><th className="text-left py-1 pr-2 font-medium text-slate-600 w-36"></th>{ADL_COLS.map(col => <th key={col} className="text-center py-1 px-1 font-semibold text-slate-700 w-10">{col}</th>)}</tr></thead>
                      <tbody>
                        {ADL_ROWS.map((row, i) => (
                          <tr key={row} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                            <td className="py-2 pr-2 text-teal-700 font-medium text-xs leading-tight">{row}</td>
                            {ADL_COLS.map(col => (<td key={col} className="text-center py-2 px-1"><input type="radio" name={`adl_${row}`} checked={(form.adl_grid || {})[row] === col} onChange={() => set("adl_grid", { ...(form.adl_grid || {}), [row]: col })} className="w-3.5 h-3.5 text-teal-600 cursor-pointer" /></td>))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              {form.therapy_type === "Occupational Therapy" && (<IADLSection iadlGrid={form.iadl_grid_ot || {}} onChange={(v) => set("iadl_grid_ot", v)} />)}
            </>
          )}
        </div>
      )}

      {/* MOBILITY / FUNCTION (evaluation) */}
      {(activeTab === "Mobility" || activeTab === "Function") && form.visit_type === "evaluation" && (
        <MobilitySection form={form} set={set} isOT={form.therapy_type === "Occupational Therapy"} />
      )}

      {/* SWALLOW (SLP evaluation) */}
      {activeTab === "Swallow" && form.visit_type === "evaluation" && (
        <SLPSwallowSection swallow={form.slp_swallow || {}} onChange={(v) => set("slp_swallow", v)} />
      )}

      {/* ASSESSMENT (evaluation) */}
      {activeTab === "Assessment" && form.visit_type === "evaluation" && (
        <div className="space-y-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="text-blue-700 font-semibold">Clinical Impression & Prognosis</Label><DictationTextarea placeholder="Diagnosis, rehab potential..." value={form.assessment || ""} onChange={(e) => set("assessment", e.target.value)} rows={5} /></div>
              <div className="border-t pt-4">
                <Label className="text-blue-700 font-semibold mb-3 block">Standardized Testing</Label>
                <StandardizedTestForm tests={form.standardized_tests || []} onChange={(tests) => set("standardized_tests", tests)} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-400">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Evaluation Complexity Level</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {["low", "moderate", "high"].map((level) => {
                  const colors = { low: "border-green-400 bg-green-50 text-green-800", moderate: "border-amber-400 bg-amber-50 text-amber-800", high: "border-red-400 bg-red-50 text-red-800" };
                  const selected = (form.medical_complexity || {}).level === level;
                  return (<button key={level} type="button" onClick={() => set("medical_complexity", { ...(form.medical_complexity || {}), level })} className={`px-4 py-3 rounded-lg border-2 text-sm font-semibold capitalize transition-all ${selected ? colors[level] : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>{level}</button>);
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* GOALS & PLAN (evaluation) */}
      {activeTab === "Goals & Plan" && form.visit_type === "evaluation" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Treatment Goals <span className="text-red-500 text-sm">★</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(form.eval_treatment_goals || []).map((goalEntry, goalIdx) => {
                const updateGoalEntry = (field, value) => { const updated = [...(form.eval_treatment_goals || [])]; updated[goalIdx] = { ...updated[goalIdx], [field]: value }; set("eval_treatment_goals", updated); };
                const selectedInterventions = goalEntry.interventions || [];
                const toggleIntervention = (opt) => { const next = selectedInterventions.includes(opt) ? selectedInterventions.filter(i => i !== opt) : [...selectedInterventions, opt]; updateGoalEntry("interventions", next); };
                const isOpen = goalEntry.interventions_open !== false;
                return (
                  <div key={goalIdx} className="border rounded-lg bg-white">
                    <div className="flex items-center justify-between px-4 pt-3 pb-1">
                      <span className="text-sm font-semibold text-slate-700">Goal {goalIdx + 1}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">Long Term<input type="checkbox" checked={goalEntry.is_long_term || false} onChange={(e) => updateGoalEntry("is_long_term", e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 cursor-pointer" /></label>
                        {(form.eval_treatment_goals || []).length > 1 && (<button type="button" onClick={() => set("eval_treatment_goals", form.eval_treatment_goals.filter((_, i) => i !== goalIdx))} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>)}
                      </div>
                    </div>
                    <div className="px-4 pb-4 space-y-3">
                      <textarea maxLength={1024} placeholder="Pt will improve..." value={goalEntry.goal || ""} onChange={(e) => updateGoalEntry("goal", e.target.value)} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                      <div><Label className="text-xs text-slate-600">Initial Status</Label><textarea maxLength={300} value={goalEntry.initial_status || ""} onChange={(e) => updateGoalEntry("initial_status", e.target.value)} rows={2} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /></div>
                      <div><Label className="text-xs text-slate-600">Expected Completion</Label><Input type="date" value={goalEntry.expected_completion || ""} onChange={(e) => updateGoalEntry("expected_completion", e.target.value)} className="max-w-xs" /></div>
                      <div>
                        <button type="button" onClick={() => updateGoalEntry("interventions_open", !isOpen)} className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"><span className="text-base leading-none">{isOpen ? "▲" : "▼"}</span> Interventions</button>
                        {isOpen && (
                          <div className="mt-2 space-y-1">
                            {INTERVENTION_OPTIONS.map((opt) => (<label key={opt} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={selectedInterventions.includes(opt)} onChange={() => toggleIntervention(opt)} className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 cursor-pointer" /><span className={`text-xs ${selectedInterventions.includes(opt) ? "text-teal-700 font-medium" : "text-slate-700"}`}>{opt}</span></label>))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <Button type="button" variant="outline" className="w-full gap-2 border-dashed" onClick={() => set("eval_treatment_goals", [...(form.eval_treatment_goals || []), { goal: "", interventions: [], is_long_term: false, initial_status: "", expected_completion: "", interventions_open: true }])}>
                <Plus className="w-4 h-4" /> Add Another Goal
              </Button>
            </CardContent>
          </Card>

          <TherapyOrdersSection therapyOrders={form.therapy_orders || {}} certPeriodStart={selectedPatient?.cert_period_start} certPeriodEnd={selectedPatient?.cert_period_end} visitDate={form.visit_date} onChange={(orders) => set("therapy_orders", orders)} />

          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Need for Skilled Services <span className="text-red-500 text-sm">★</span></CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="text-blue-700 font-semibold">Skilled Service Narrative <span className="text-red-500">★</span></Label><DictationTextarea maxLength={1024} placeholder="Describe the need for skilled services..." value={form.plan || ""} onChange={(e) => set("plan", e.target.value)} rows={4} /></div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-teal-400">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Care Coordination <span className="text-red-500 text-sm">★</span></CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {["RN", "PTA", "SLP", "Scheduler", "LPN/LVN", "OT", "MSW", "MD", "PT", "COTA", "Agency"].map((item) => {
                  const checked = ((form.care_coordination || {}).disciplines || []).includes(item);
                  return (<label key={item} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={checked} onChange={(e) => { const current = (form.care_coordination || {}).disciplines || []; set("care_coordination", { ...(form.care_coordination || {}), disciplines: e.target.checked ? [...current, item] : current.filter((d) => d !== item) }); }} className="w-4 h-4 rounded border-slate-300 text-teal-600 cursor-pointer" /><span className="text-sm text-slate-700">{item}</span></label>);
                })}
              </div>
              <div><Label className="text-sm text-slate-600">Reason <span className="text-red-500">★</span></Label><DictationTextarea maxLength={300} placeholder="N/A" value={(form.care_coordination || {}).reason || ""} onChange={(e) => set("care_coordination", { ...(form.care_coordination || {}), reason: e.target.value })} rows={3} /></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DC PLAN & PATIENT EDUCATION (evaluation) */}
      {activeTab === "DC Plan & Edu" && form.visit_type === "evaluation" && (
        <>
          <DCPlanEducationSection form={form} set={set} />
          {form.include_soc_oasis && (<DischargeOasisSection oasis={form.soc_oasis || {}} onChange={(v) => set("soc_oasis", v)} />)}
        </>
      )}

      {/* SOAP NOTE (treatment) */}
      {activeTab === "SOAP Note" && form.visit_type === "treatment" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Treatment Note (SOAP)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="text-teal-700 font-semibold">Subjective</Label><DictationTextarea placeholder="Patient report, complaints..." value={form.subjective || ""} onChange={(e) => set("subjective", e.target.value)} rows={3} /></div>
              <div><Label className="text-blue-700 font-semibold">Objective</Label><DictationTextarea placeholder="Objective findings..." value={form.objective || ""} onChange={(e) => set("objective", e.target.value)} rows={4} /></div>
              <div><Label className="text-amber-700 font-semibold">Assessment</Label><DictationTextarea placeholder="Clinical assessment..." value={form.assessment || ""} onChange={(e) => set("assessment", e.target.value)} rows={3} /></div>
              <div><Label className="text-violet-700 font-semibold">Plan</Label><DictationTextarea placeholder="Treatment plan..." value={form.plan || ""} onChange={(e) => set("plan", e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TREATMENT RENDERED */}
      {activeTab === "Treatment Rendered" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TreatmentRenderedSection treatmentRendered={form.treatment_rendered || {}} onChange={(v) => set("treatment_rendered", v)} therapyType={form.therapy_type} />

          <Card className="border-l-4 border-l-amber-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Recent Treatment Sessions</CardTitle>
              <p className="text-xs text-slate-500 mt-1">View past sessions or import data from the last visit</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const recentTreatments = patientVisits
                  .filter(v =>
                    v.therapy_type === form.therapy_type &&
                    (v.visit_type === 'treatment' || v.visit_type === 're_evaluation' || v.visit_type === 'recertification') &&
                    v.id !== form.id
                  )
                  .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date))
                  .slice(0, 5);

                const lastNoteWithData = recentTreatments.find(v => v.treatment_rendered);

                return (
                  <>
                    <Button
                      type="button"
                      className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow"
                      disabled={!lastNoteWithData}
                      onClick={() => {
                        if (lastNoteWithData) set("treatment_rendered", { ...lastNoteWithData.treatment_rendered });
                      }}
                    >
                      <FileUp className="w-4 h-4" />
                      Import Last Treatment Data
                    </Button>
                    {!lastNoteWithData && recentTreatments.length > 0 && (
                      <p className="text-xs text-slate-400 italic text-center">Prior sessions found but none have treatment data recorded yet.</p>
                    )}
                    {recentTreatments.length === 0 && (
                      <p className="text-sm text-slate-400 italic">No previous treatment sessions found.</p>
                    )}

                    {recentTreatments.length > 0 && (
                      <div className="space-y-2 mt-1">
                        {recentTreatments.map((visit) => {
                          const tr = visit.treatment_rendered || {};
                          const doneItems = Object.entries(tr.items || {})
                            .filter(([, val]) => val.done)
                            .map(([k]) => k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
                          const isLast = visit.id === lastNoteWithData?.id;
                          return (
                            <div key={visit.id} className={`rounded-lg border p-3 ${isLast ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  {isLast && <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">LAST</span>}
                                  <span className="text-sm font-medium text-slate-700">
                                    {format(new Date(visit.visit_date), 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-400 capitalize">{(visit.visit_type || '').replace(/_/g, ' ')}</span>
                              </div>
                              {doneItems.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {doneItems.slice(0, 4).map((item, j) => (
                                    <span key={j} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{item}</span>
                                  ))}
                                  {doneItems.length > 4 && <span className="text-[10px] text-slate-400">+{doneItems.length - 4} more</span>}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">No treatment items recorded</p>
                              )}
                              {tr.notes && <p className="text-xs text-slate-500 mt-1.5 truncate">{tr.notes}</p>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* RE-EVALUATION */}
      {activeTab === "Re-Evaluation" && (form.visit_type === "re_evaluation" || form.visit_type === "recertification") && (
        <ReevalTab form={form} set={set} isAssistant={isAssistant} therapistName={selectedTherapist?.full_name} therapists={therapists} selectedPatient={selectedPatient} />
      )}

      {/* GOALS (treatment) */}
      {activeTab === "Goals" && form.visit_type === "treatment" && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Session Documentation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Interventions</Label><div className="flex gap-2 mt-1"><Input placeholder="Enter an intervention…" value={interventionInput} onChange={(e) => setInterventionInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIntervention())} /><Button type="button" size="icon" variant="outline" onClick={addIntervention}><Plus className="w-4 h-4" /></Button></div><div className="flex flex-wrap gap-2 mt-2">{(form.interventions || []).map((g, i) => (<Badge key={i} variant="secondary" className="gap-1 pr-1">{g}<button onClick={() => set("interventions", form.interventions.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button></Badge>))}</div></div>
            <div><Label>Patient Response</Label><DictationTextarea placeholder="How did the patient respond?" value={form.patient_response || ""} onChange={(e) => set("patient_response", e.target.value)} rows={3} /></div>
            <div><Label>Functional Status</Label><Select value={form.functional_status || ""} onValueChange={(v) => set("functional_status", v)}><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger><SelectContent>{FUNCTIONAL_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent></Select></div>
          </CardContent>
        </Card>
      )}

      {/* GOALS (re_evaluation / recertification) */}
      {activeTab === "Goals" && (form.visit_type === "re_evaluation" || form.visit_type === "recertification") && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Goals</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(form.reeval_goals || []).length === 0 && (<p className="text-sm text-slate-400 italic">No goals yet. Click Add Goal below.</p>)}
            {(form.reeval_goals || []).map((goalEntry, idx) => {
              const updateEntry = (field, value) => { const updated = [...(form.reeval_goals || [])]; updated[idx] = { ...updated[idx], [field]: value }; set('reeval_goals', updated); };
              return (
                <div key={idx} className="border-b pb-6 last:border-b-0 last:pb-0 space-y-3">
                  <div className="flex items-center justify-between"><p className="text-sm font-semibold text-amber-700">Goal: {idx + 1}</p><button type="button" onClick={() => set('reeval_goals', (form.reeval_goals || []).filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button></div>
                  <Textarea value={goalEntry.goal || ''} onChange={(e) => updateEntry('goal', e.target.value)} rows={3} className="text-sm" />
                  <div><Label className="text-sm text-slate-600">Prior Assessment Status:</Label><Textarea value={goalEntry.prior_assessment_status || ''} onChange={(e) => updateEntry('prior_assessment_status', e.target.value)} rows={2} maxLength={300} className="text-sm mt-1" /></div>
                  <div><Label className="text-sm text-slate-600">Reassessment Status:</Label><Textarea value={goalEntry.reassessment_status || ''} onChange={(e) => updateEntry('reassessment_status', e.target.value)} rows={2} maxLength={300} className="text-sm mt-1" /></div>
                  <div>
                    <Label className="text-sm text-slate-600">Goal Status:</Label>
                    <div className="flex gap-6 mt-2">{['continue', 'modify', 'goal_met'].map((status) => (<label key={status} className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`goal_status_${idx}`} checked={goalEntry.goal_status === status} onChange={() => updateEntry('goal_status', status)} className="w-4 h-4 text-teal-600 cursor-pointer" /><span className="text-sm text-slate-700 capitalize">{status === 'goal_met' ? 'Goal Met' : status.charAt(0).toUpperCase() + status.slice(1)}</span></label>))}</div>
                  </div>
                  {goalEntry.goal_status === 'modify' && (<div className="border border-amber-200 bg-amber-50 rounded-lg p-3 space-y-2"><Label className="text-sm font-semibold text-amber-800">Modified Goal:</Label><Textarea placeholder="Enter the modified goal text..." value={goalEntry.modified_goal || ''} onChange={(e) => updateEntry('modified_goal', e.target.value)} rows={3} className="text-sm bg-white" /></div>)}
                </div>
              );
            })}
            <Button type="button" variant="outline" className="w-full gap-2 border-dashed mt-2" onClick={() => set('reeval_goals', [...(form.reeval_goals || []), { goal: '', prior_assessment_status: '', reassessment_status: '', goal_status: 'continue', modified_goal: '', modified_date: '' }])}>
              <Plus className="w-4 h-4" /> Add Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* PLAN (re_evaluation / recertification) */}
      {activeTab === "Plan" && (form.visit_type === "re_evaluation" || form.visit_type === "recertification") && (
        <ReevalPlanTab form={form} set={set} selectedPatient={selectedPatient} />
      )}

      {/* DISCHARGE */}
      {activeTab === "Discharge" && (form.visit_type === "discharge_with_visit" || form.visit_type === "discharge_without_visit") && (
        <div className="space-y-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Discharge Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="text-green-700 font-semibold">Treatment Summary</Label><DictationTextarea placeholder="Total visits, duration..." value={form.subjective || ""} onChange={(e) => set("subjective", e.target.value)} rows={3} /></div>
              <div><Label className="text-green-700 font-semibold">Outcomes & Goal Achievement</Label><DictationTextarea placeholder="Final measurements..." value={form.objective || ""} onChange={(e) => set("objective", e.target.value)} rows={4} /></div>
              <div><Label className="text-green-700 font-semibold">Reason for Discharge</Label><DictationTextarea placeholder="Goals met, plateaued..." value={form.assessment || ""} onChange={(e) => set("assessment", e.target.value)} rows={3} /></div>
              <div><Label className="text-green-700 font-semibold">HEP & Recommendations</Label><DictationTextarea placeholder="HEP instructions..." value={form.plan || ""} onChange={(e) => set("plan", e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>
          {form.require_discharge_oasis && (<DischargeOasisSection oasis={form.discharge_oasis || {}} onChange={(v) => set("discharge_oasis", v)} />)}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Discharge Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Final Functional Status</Label><Select value={form.functional_status || ""} onValueChange={(v) => set("functional_status", v)}><SelectTrigger><SelectValue placeholder="Select final level" /></SelectTrigger><SelectContent>{FUNCTIONAL_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent></Select></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* NOMNC */}
      {activeTab === "NOMNC" && form.include_nomnc && (
        <NomncTab form={form} set={set} />
      )}

      {/* EVAL REFUSED / MISSED VISIT */}
      {activeTab === "Notes" && (form.visit_type === "eval_refused" || form.visit_type === "missed_visit") && (
        <div className="space-y-6">
          <Card className="border-l-4 border-l-orange-400">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">{form.visit_type === "eval_refused" ? "Eval Refused" : "Missed Visit"} — Notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="text-orange-700 font-semibold">{form.visit_type === "eval_refused" ? "Reason Refused" : "Reason Missed"} <span className="text-red-500">★</span></Label><DictationTextarea placeholder="Reason..." value={form.missed_visit_reason || ""} onChange={(e) => set("missed_visit_reason", e.target.value)} rows={4} /></div>
              <div><Label className="text-slate-700 font-semibold">Additional Notes</Label><DictationTextarea placeholder="Additional context..." value={form.assessment || ""} onChange={(e) => set("assessment", e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SIGNATURE */}
      {activeTab === "Signature" && (
        <SignatureTab form={form} set={set} patientAgencyName={patientAgencyName} patientAgencyRecord={patientAgencyRecord} agencyDocsOnly={agencyDocsOnly}
          onAutoSave={(data) => { const autoSaveFn = onAutoSave || onSave; if (autoSaveFn) autoSaveFn({ ...data, status: form.status === "signed" ? "signed" : "draft" }).catch(() => {}); }} />
      )}

      <NavButtons />
    </div>
  );
}
