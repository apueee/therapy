"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/audit/logger";

function toSnakeCase(p) {
  const rp = p.responsibleParty || {};
  const ph = p.physicians || {};
  const at = p.assignedTherapists || {};
  const vc = p.visitCounts || {};

  return {
    id: p.id,
    first_name: p.firstName,
    last_name: p.lastName,
    date_of_birth: p.dateOfBirth,
    sex: p.sex?.toLowerCase(),
    ssn: p.ssnEncrypted || null,
    medicare_number: p.medicareNumber,
    phone: p.phone,
    email: p.email,
    address: p.address,
    city: p.city,
    state: p.state,
    zip: p.zip,
    agency_id: p.agencyId,
    agency: p.agency?.name || null,
    agency_name: p.agency?.name || null,
    insurance: p.insurance,
    coordinator_email: p.coordinatorEmail,
    cert_period_start: p.certPeriodStart,
    cert_period_end: p.certPeriodEnd,
    authorization_number: p.authorizationNumber,
    authorized_visits: p.authorizedVisits,
    therapy_types: (p.therapyTypes || []).map(t => t.toLowerCase()),
    notes: p.notes,
    status: p.status?.toLowerCase(),
    responsible_party_name: rp.name || null,
    responsible_party_phone: rp.phone || null,
    responsible_party_relationship: rp.relationship || null,
    primary_physician: ph.primaryName || null,
    primary_physician_phone: ph.primaryPhone || null,
    referring_physician: ph.referringName || null,
    referring_physician_phone: ph.referringPhone || null,
    evaluating_therapist_pt: at.evaluatingPt || null,
    treating_therapist_pt: at.treatingPt || null,
    evaluating_therapist_ot: at.evaluatingOt || null,
    treating_therapist_ot: at.treatingOt || null,
    evaluating_therapist_st: at.evaluatingSt || null,
    treating_therapist_st: at.treatingSt || null,
    pt_eval_visits: vc.ptEval || null,
    pt_treatment_visits: vc.ptTreatment || null,
    ot_eval_visits: vc.otEval || null,
    ot_treatment_visits: vc.otTreatment || null,
    st_eval_visits: vc.stEval || null,
    st_treatment_visits: vc.stTreatment || null,
    diagnoses: p.diagnoses?.map(d => ({
      id: d.id,
      diagnosis: d.diagnosis,
      icd10_code: d.icd10Code,
      is_primary: d.isPrimary,
    })),
    created_at: p.createdAt,
  };
}

export async function getPatients() {
  await requireAuth();

  const patients = await prisma.patient.findMany({
    include: {
      agency: { select: { name: true } },
      diagnoses: { orderBy: { isPrimary: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return patients.map(toSnakeCase);
}

export async function getPatientById(id) {
  await requireAuth();

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      agency: { select: { id: true, name: true } },
      diagnoses: { orderBy: { isPrimary: "desc" } },
    },
  });

  return patient ? toSnakeCase(patient) : null;
}

export async function getAgenciesForSelect() {
  return prisma.agency.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function createPatient(data) {
  const user = await requireRole("SUPERUSER", "ADMIN", "COORDINATOR");

  const patient = await prisma.patient.create({
    data: {
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : null,
      sex: data.sex?.toUpperCase() || null,
      medicareNumber: data.medicare_number || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      agencyId: data.agency_id || null,
      insurance: data.insurance || null,
      coordinatorEmail: data.coordinator_email || null,
      certPeriodStart: data.cert_period_start ? new Date(data.cert_period_start) : null,
      certPeriodEnd: data.cert_period_end ? new Date(data.cert_period_end) : null,
      authorizationNumber: data.authorization_number || null,
      authorizedVisits: data.authorized_visits ? parseInt(data.authorized_visits) : null,
      therapyTypes: (data.therapy_types || []).map(t => t.toUpperCase()),
      notes: data.notes || null,
      status: (data.status || "ACTIVE").toUpperCase(),
      responsibleParty: (data.responsible_party_name || data.responsible_party_phone) ? {
        name: data.responsible_party_name || null,
        phone: data.responsible_party_phone || null,
        relationship: data.responsible_party_relationship || null,
      } : null,
      physicians: (data.primary_physician || data.referring_physician) ? {
        primaryName: data.primary_physician || null,
        primaryPhone: data.primary_physician_phone || null,
        referringName: data.referring_physician || null,
        referringPhone: data.referring_physician_phone || null,
      } : null,
      assignedTherapists: {
        evaluatingPt: data.evaluating_therapist_pt || null,
        treatingPt: data.treating_therapist_pt || null,
        evaluatingOt: data.evaluating_therapist_ot || null,
        treatingOt: data.treating_therapist_ot || null,
        evaluatingSt: data.evaluating_therapist_st || null,
        treatingSt: data.treating_therapist_st || null,
      },
      visitCounts: {
        ptEval: data.pt_eval_visits || null,
        ptTreatment: data.pt_treatment_visits || null,
        otEval: data.ot_eval_visits || null,
        otTreatment: data.ot_treatment_visits || null,
        stEval: data.st_eval_visits || null,
        stTreatment: data.st_treatment_visits || null,
      },
      diagnoses: data.diagnoses?.length ? {
        create: data.diagnoses
          .filter(d => d.diagnosis?.trim())
          .map((d, i) => ({
            diagnosis: d.diagnosis,
            icd10Code: d.icd10_code || null,
            isPrimary: i === 0,
          })),
      } : undefined,
    },
  });

  const h = await headers();
  await logAudit({
    user,
    action: "CREATE",
    resourceType: "Patient",
    resourceId: patient.id,
    resourceLabel: `${data.first_name} ${data.last_name}`,
    details: "Created patient record",
    ipAddress: getClientIp(h),
  });

  return { success: true, id: patient.id };
}

export async function updatePatient(id, data) {
  const user = await requireRole("SUPERUSER", "ADMIN", "COORDINATOR");

  await prisma.$transaction(async (tx) => {
    if (data.diagnoses) {
      await tx.patientDiagnosis.deleteMany({ where: { patientId: id } });
    }

    const updateData = {};
    if (data.first_name !== undefined) updateData.firstName = data.first_name;
    if (data.last_name !== undefined) updateData.lastName = data.last_name;
    if (data.date_of_birth !== undefined) updateData.dateOfBirth = data.date_of_birth ? new Date(data.date_of_birth) : null;
    if (data.sex !== undefined) updateData.sex = data.sex?.toUpperCase() || null;
    if (data.medicare_number !== undefined) updateData.medicareNumber = data.medicare_number || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.state !== undefined) updateData.state = data.state || null;
    if (data.zip !== undefined) updateData.zip = data.zip || null;
    if (data.agency_id !== undefined) updateData.agencyId = data.agency_id || null;
    if (data.insurance !== undefined) updateData.insurance = data.insurance || null;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase();
    if (data.therapy_types !== undefined) updateData.therapyTypes = data.therapy_types.map(t => t.toUpperCase());
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.responsible_party_name !== undefined || data.responsible_party_phone !== undefined) {
      updateData.responsibleParty = {
        name: data.responsible_party_name || null,
        phone: data.responsible_party_phone || null,
        relationship: data.responsible_party_relationship || null,
      };
    }
    if (data.primary_physician !== undefined || data.referring_physician !== undefined) {
      updateData.physicians = {
        primaryName: data.primary_physician || null,
        primaryPhone: data.primary_physician_phone || null,
        referringName: data.referring_physician || null,
        referringPhone: data.referring_physician_phone || null,
      };
    }
    if (data.evaluating_therapist_pt !== undefined || data.treating_therapist_pt !== undefined) {
      updateData.assignedTherapists = {
        evaluatingPt: data.evaluating_therapist_pt || null,
        treatingPt: data.treating_therapist_pt || null,
        evaluatingOt: data.evaluating_therapist_ot || null,
        treatingOt: data.treating_therapist_ot || null,
        evaluatingSt: data.evaluating_therapist_st || null,
        treatingSt: data.treating_therapist_st || null,
      };
    }
    if (data.pt_eval_visits !== undefined || data.ot_eval_visits !== undefined || data.st_eval_visits !== undefined) {
      updateData.visitCounts = {
        ptEval: data.pt_eval_visits || null,
        ptTreatment: data.pt_treatment_visits || null,
        otEval: data.ot_eval_visits || null,
        otTreatment: data.ot_treatment_visits || null,
        stEval: data.st_eval_visits || null,
        stTreatment: data.st_treatment_visits || null,
      };
    }

    if (data.diagnoses?.length) {
      updateData.diagnoses = {
        create: data.diagnoses
          .filter(d => d.diagnosis?.trim())
          .map((d, i) => ({
            diagnosis: d.diagnosis,
            icd10Code: d.icd10_code || null,
            isPrimary: i === 0,
          })),
      };
    }

    await tx.patient.update({ where: { id }, data: updateData });
  });

  const h = await headers();
  await logAudit({
    user,
    action: "UPDATE",
    resourceType: "Patient",
    resourceId: id,
    details: "Updated patient record",
    ipAddress: getClientIp(h),
  });

  return { success: true };
}

export async function deletePatient(id) {
  const user = await requireRole("SUPERUSER", "ADMIN");

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { firstName: true, lastName: true },
  });

  await prisma.patient.delete({ where: { id } });

  const h = await headers();
  await logAudit({
    user,
    action: "DELETE",
    resourceType: "Patient",
    resourceId: id,
    resourceLabel: patient ? `${patient.firstName} ${patient.lastName}` : id,
    details: "Deleted patient record",
    ipAddress: getClientIp(h),
  });

  return { success: true };
}
