import { NextResponse } from "next/server";
import { z } from "zod";

import { isResponse, requireAdminApi } from "@/lib/auth";
import { run } from "@/lib/db";

export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["new", "read", "actioned", "archived"]).optional(),
  adminNote: z.string().max(2000).nullable().optional(),
});

const DeleteSchema = z.object({ id: z.number().int().positive() });

export async function PATCH(request: Request) {
  const session = await requireAdminApi();
  if (isResponse(session)) return session;

  const parsed = PatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const { id, status, adminNote } = parsed.data;

  try {
    if (status !== undefined) {
      await run(`UPDATE feedback SET status = ?, updated_at = datetime('now') WHERE id = ?`, [status, id]);
    }
    if (adminNote !== undefined) {
      await run(`UPDATE feedback SET admin_note = ?, updated_at = datetime('now') WHERE id = ?`, [
        adminNote,
        id,
      ]);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/feedback] update failed:", err);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdminApi();
  if (isResponse(session)) return session;

  const parsed = DeleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    await run(`DELETE FROM feedback WHERE id = ?`, [parsed.data.id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/feedback] delete failed:", err);
    return NextResponse.json({ ok: false, error: "Delete failed." }, { status: 500 });
  }
}
