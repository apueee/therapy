"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/audit/logger";

function toSnakeCase(a) {
  return {
    id: a.id,
    name: a.name,
    address: a.address,
    city: a.city,
    state: a.state,
    zip: a.zip,
    phone: a.phone,
    fax: a.fax,
    email: a.email,
    document_mode: a.documentMode?.toLowerCase(),
    assistants_allowed: a.assistantsAllowed,
    supervisory_visit_frequency: a.supervisoryVisitFrequency,
    work_week_start_day: a.workWeekStartDay,
    documentation_setup: a.documentationSetup,
    required_visit_documents: a.requiredVisitDocuments || [],
    agency_documents: a.agencyDocuments,
    notes: a.notes,
    status: a.status?.toLowerCase(),
    contacts: (a.contacts || []).map(c => ({
      id: c.id,
      name: c.name,
      title: c.title,
      phone: c.phone,
      email: c.email,
    })),
    rates: (a.rates || []).map(r => ({
      id: r.id,
      therapy_type: r.therapyType,
      visit_type: r.visitType,
      rate: parseFloat(r.rate),
    })),
    created_at: a.createdAt,
  };
}

export async function getAgencies() {
  await requireRole("SUPERUSER", "ADMIN", "COORDINATOR");

  const agencies = await prisma.agency.findMany({
    include: {
      contacts: true,
      rates: true,
    },
    orderBy: { name: "asc" },
  });

  return agencies.map(toSnakeCase);
}

export async function getAgencyById(id) {
  await requireRole("SUPERUSER", "ADMIN", "COORDINATOR");

  const agency = await prisma.agency.findUnique({
    where: { id },
    include: { contacts: true, rates: true },
  });

  return agency ? toSnakeCase(agency) : null;
}

export async function createAgency(data) {
  const user = await requireRole("SUPERUSER", "ADMIN");

  const agency = await prisma.agency.create({
    data: {
      name: data.name,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      phone: data.phone || null,
      fax: data.fax || null,
      email: data.email || null,
      notes: data.notes || null,
      status: (data.status || "active").toUpperCase(),
      documentMode: (data.document_mode || "theradocs").toUpperCase(),
      assistantsAllowed: data.assistants_allowed !== false,
      supervisoryVisitFrequency: data.supervisory_visit_frequency || null,
      contacts: data.contacts?.length ? {
        create: data.contacts
          .filter(c => c.name?.trim())
          .map(c => ({
            name: c.name,
            title: c.title || null,
            phone: c.phone || null,
            email: c.email || null,
          })),
      } : undefined,
    },
  });

  const h = await headers();
  await logAudit({
    user,
    action: "CREATE",
    resourceType: "Agency",
    resourceId: agency.id,
    resourceLabel: data.name,
    details: "Created agency",
    ipAddress: getClientIp(h),
  });

  return { success: true, id: agency.id };
}

export async function updateAgency(id, data) {
  const user = await requireRole("SUPERUSER", "ADMIN");

  await prisma.$transaction(async (tx) => {
    if (data.contacts) {
      await tx.agencyContact.deleteMany({ where: { agencyId: id } });
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.state !== undefined) updateData.state = data.state || null;
    if (data.zip !== undefined) updateData.zip = data.zip || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.fax !== undefined) updateData.fax = data.fax || null;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase();
    if (data.document_mode !== undefined) updateData.documentMode = data.document_mode.toUpperCase();
    if (data.assistants_allowed !== undefined) updateData.assistantsAllowed = data.assistants_allowed;
    if (data.supervisory_visit_frequency !== undefined) updateData.supervisoryVisitFrequency = data.supervisory_visit_frequency;
    if (data.documentation_setup !== undefined) updateData.documentationSetup = data.documentation_setup;
    if (data.required_visit_documents !== undefined) updateData.requiredVisitDocuments = data.required_visit_documents;
    if (data.work_week_start_day !== undefined) updateData.workWeekStartDay = data.work_week_start_day;

    if (data.contacts?.length) {
      updateData.contacts = {
        create: data.contacts
          .filter(c => c.name?.trim())
          .map(c => ({
            name: c.name,
            title: c.title || null,
            phone: c.phone || null,
            email: c.email || null,
          })),
      };
    }

    await tx.agency.update({ where: { id }, data: updateData });
  });

  const h = await headers();
  await logAudit({
    user,
    action: "UPDATE",
    resourceType: "Agency",
    resourceId: id,
    details: "Updated agency",
    ipAddress: getClientIp(h),
  });

  return { success: true };
}

export async function deleteAgency(id) {
  const user = await requireRole("SUPERUSER", "ADMIN");

  const agency = await prisma.agency.findUnique({
    where: { id },
    select: { name: true },
  });

  await prisma.agency.delete({ where: { id } });

  const h = await headers();
  await logAudit({
    user,
    action: "DELETE",
    resourceType: "Agency",
    resourceId: id,
    resourceLabel: agency?.name || id,
    details: "Deleted agency",
    ipAddress: getClientIp(h),
  });

  return { success: true };
}
