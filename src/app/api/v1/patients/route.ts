import { NextRequest } from "next/server";
import { getPatients, createPatient } from "@/app/(app)/Patients/actions";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const patients = await getPatients();
    return apiSuccess(patients);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await createPatient(data);
    return apiSuccess(result, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
