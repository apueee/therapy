"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/audit/logger";

function toSnakeCase(t) {
  return {
    id: t.id,
    full_name: t.fullName,
    discipline: t.discipline === "PT" ? "Physical Therapy"
      : t.discipline === "OT" ? "Occupational Therapy"
      : t.discipline === "ST" ? "Speech Therapy"
      : t.discipline,
    credentials: t.credentials,
    license_number: t.licenseNumber,
    email: t.email,
    phone: t.phone,
    hire_date: t.hireDate,
    annual_review_date: t.annualReviewDate,
    status: t.status?.toLowerCase(),
    facilities: t.facilities || [],
    rates: t.rates || {},
    personal_files: t.personalFiles || {},
    disciplinary_actions: t.disciplinaryActions || [],
    created_at: t.createdAt,
  };
}

const DISCIPLINE_MAP = {
  "Physical Therapy": "PT",
  "Occupational Therapy": "OT",
  "Speech Therapy": "ST",
};

export async function getTherapists() {
  await requireRole("SUPERUSER", "ADMIN", "COORDINATOR", "HR");

  const therapists = await prisma.therapist.findMany({
    orderBy: { fullName: "asc" },
  });

  return therapists.map(toSnakeCase);
}

export async function getTherapistById(id) {
  await requireRole("SUPERUSER", "ADMIN", "COORDINATOR", "HR");

  const therapist = await prisma.therapist.findUnique({ where: { id } });
  return therapist ? toSnakeCase(therapist) : null;
}

export async function createTherapist(data) {
  const user = await requireRole("SUPERUSER", "ADMIN", "HR");

  const therapist = await prisma.therapist.create({
    data: {
      fullName: data.full_name,
      discipline: DISCIPLINE_MAP[data.discipline] || data.discipline,
      credentials: data.credentials || null,
      licenseNumber: data.license_number || null,
      email: data.email || null,
      phone: data.phone || null,
      hireDate: data.hire_date ? new Date(data.hire_date) : null,
      annualReviewDate: data.annual_review_date ? new Date(data.annual_review_date) : null,
      status: (data.status || "active").toUpperCase(),
      facilities: data.facilities || [],
      rates: data.rates || null,
      personalFiles: data.personal_files || null,
      disciplinaryActions: data.disciplinary_actions || null,
    },
  });

  const h = await headers();
  await logAudit({
    user,
    action: "CREATE",
    resourceType: "Therapist",
    resourceId: therapist.id,
    resourceLabel: data.full_name,
    details: "Created therapist profile",
    ipAddress: getClientIp(h),
  });

  return { success: true, id: therapist.id };
}

export async function updateTherapist(id, data) {
  const user = await requireRole("SUPERUSER", "ADMIN", "HR");

  const updateData = {};
  if (data.full_name !== undefined) updateData.fullName = data.full_name;
  if (data.discipline !== undefined) updateData.discipline = DISCIPLINE_MAP[data.discipline] || data.discipline;
  if (data.credentials !== undefined) updateData.credentials = data.credentials || null;
  if (data.license_number !== undefined) updateData.licenseNumber = data.license_number || null;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.hire_date !== undefined) updateData.hireDate = data.hire_date ? new Date(data.hire_date) : null;
  if (data.annual_review_date !== undefined) updateData.annualReviewDate = data.annual_review_date ? new Date(data.annual_review_date) : null;
  if (data.status !== undefined) updateData.status = data.status.toUpperCase();
  if (data.facilities !== undefined) updateData.facilities = data.facilities;
  if (data.rates !== undefined) updateData.rates = data.rates;
  if (data.personal_files !== undefined) updateData.personalFiles = data.personal_files;
  if (data.disciplinary_actions !== undefined) updateData.disciplinaryActions = data.disciplinary_actions;

  await prisma.therapist.update({ where: { id }, data: updateData });

  const h = await headers();
  await logAudit({
    user,
    action: "UPDATE",
    resourceType: "Therapist",
    resourceId: id,
    details: "Updated therapist profile",
    ipAddress: getClientIp(h),
  });

  return { success: true };
}

export async function deleteTherapist(id) {
  const user = await requireRole("SUPERUSER", "ADMIN");

  const therapist = await prisma.therapist.findUnique({
    where: { id },
    select: { fullName: true },
  });

  await prisma.therapist.delete({ where: { id } });

  const h = await headers();
  await logAudit({
    user,
    action: "DELETE",
    resourceType: "Therapist",
    resourceId: id,
    resourceLabel: therapist?.fullName || id,
    details: "Deleted therapist profile",
    ipAddress: getClientIp(h),
  });

  return { success: true };
}
