"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/audit/logger";

function toSnakeCase(user) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    phone: user.phone,
    role: user.role?.toLowerCase(),
    user_type: user.userType?.toLowerCase(),
    therapist_id: user.therapistId,
    credentials: user.credentials,
    license_number: user.licenseNumber,
    discipline: user.discipline,
    created_at: user.createdAt,
  };
}

export async function getUsers() {
  await requireRole("SUPERUSER", "ADMIN");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      userType: true,
      therapistId: true,
      credentials: true,
      licenseNumber: true,
      discipline: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map(toSnakeCase);
}

export async function inviteUser({ email, userType }) {
  const user = await requireRole("SUPERUSER", "ADMIN");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "A user with this email already exists" };
  }

  const roleMap = {
    superuser: "SUPERUSER",
    admin: "ADMIN",
    therapist: "USER",
    coordinator: "USER",
    hr: "USER",
    guest: "USER",
    client: "USER",
  };

  const passwordHash = await hashPassword("changeme123");

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: roleMap[userType] ?? "USER",
      userType: userType.toUpperCase(),
    },
  });

  const h = await headers();
  await logAudit({
    user,
    action: "CREATE",
    resourceType: "User",
    details: `Invited user ${email} as ${userType}`,
    ipAddress: getClientIp(h),
  });

  return { success: true };
}

export async function updateUser({ id, data }) {
  const user = await requireRole("SUPERUSER", "ADMIN");

  const roleMap = {
    superuser: "SUPERUSER",
    admin: "ADMIN",
    therapist: "USER",
    coordinator: "USER",
    hr: "USER",
    guest: "USER",
    client: "USER",
  };

  const updateData = {};
  if (data.user_type) {
    updateData.userType = data.user_type.toUpperCase();
    updateData.role = roleMap[data.user_type] ?? "USER";
  }
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.credentials !== undefined) updateData.credentials = data.credentials;
  if (data.license_number !== undefined) updateData.licenseNumber = data.license_number;
  if (data.discipline !== undefined) updateData.discipline = data.discipline || null;

  await prisma.user.update({ where: { id }, data: updateData });

  const h = await headers();
  await logAudit({
    user,
    action: "UPDATE",
    resourceType: "User",
    resourceId: id,
    details: "Updated user profile",
    ipAddress: getClientIp(h),
  });

  return { success: true };
}

export async function syncTherapistsToUsers() {
  const user = await requireRole("SUPERUSER", "ADMIN");

  const therapists = await prisma.therapist.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      fullName: true,
      email: true,
      credentials: true,
      licenseNumber: true,
      discipline: true,
    },
  });

  let created = 0;
  let linked = 0;

  for (const therapist of therapists) {
    if (!therapist.email) continue;

    const existingUser = await prisma.user.findUnique({ where: { email: therapist.email } });

    if (existingUser) {
      if (!existingUser.therapistId) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            therapistId: therapist.id,
            discipline: therapist.discipline,
            credentials: therapist.credentials,
            licenseNumber: therapist.licenseNumber,
          },
        });
        linked++;
      }
    } else {
      const passwordHash = await hashPassword("changeme123");
      await prisma.user.create({
        data: {
          email: therapist.email,
          passwordHash,
          fullName: therapist.fullName,
          role: "USER",
          userType: "THERAPIST",
          therapistId: therapist.id,
          discipline: therapist.discipline,
          credentials: therapist.credentials,
          licenseNumber: therapist.licenseNumber,
        },
      });
      created++;
    }
  }

  const h = await headers();
  await logAudit({
    user,
    action: "UPDATE",
    resourceType: "User",
    details: `Synced therapists: ${created} created, ${linked} linked`,
    ipAddress: getClientIp(h),
  });

  return { created, linked };
}

export async function verifyCurrentUserPassword(password) {
  const sessionUser = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { success: false, error: "Account has no password set" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Incorrect password" };
  }

  return { success: true };
}
