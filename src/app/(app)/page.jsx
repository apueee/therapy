"use client";

import SuperuserDashboard from "@/components/dashboard/SuperuserDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import TherapistDashboard from "@/components/dashboard/TherapistDashboard";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import GuestDashboard from "@/components/dashboard/GuestDashboard";
import CoordinatorDashboard from "@/components/dashboard/CoordinatorDashboard";
import HRDashboard from "@/components/dashboard/HRDashboard";

export default function Dashboard() {
  const effectiveUser = { user_type: "therapist", full_name: "User" };
  const userType = effectiveUser?.user_type || effectiveUser?.role || "therapist";

  switch (userType) {
    case "superuser":
      return <SuperuserDashboard user={effectiveUser} />;
    case "admin":
      return <AdminDashboard user={effectiveUser} />;
    case "therapist":
      return <TherapistDashboard user={effectiveUser} />;
    case "client":
      return <ClientDashboard user={effectiveUser} />;
    case "coordinator":
      return <CoordinatorDashboard user={effectiveUser} />;
    case "hr":
      return <HRDashboard user={effectiveUser} />;
    case "guest":
      return <GuestDashboard user={effectiveUser} />;
    default:
      return <TherapistDashboard user={effectiveUser} />;
  }
}
