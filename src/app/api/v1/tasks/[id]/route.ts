import { NextRequest } from "next/server";
import { updateTaskStatus, deleteTask } from "@/app/(app)/TaskAssignment/actions";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    if (!status) return apiError("status is required", 400);
    const result = await updateTaskStatus(id, status);
    return apiSuccess(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteTask(id);
    return apiSuccess(result);
  } catch (err) {
    return handleApiError(err);
  }
}
