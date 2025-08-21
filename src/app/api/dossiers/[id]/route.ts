import { prisma } from "@/lib/prisma";
import { ensureAuth } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await ensureAuth(req);
  if (unauthorized) return unauthorized;

  const item = await prisma.dossier.findUnique({ where: { id: params.id } });
  if (!item) return new Response("Not found", { status: 404 });
  return Response.json(item);
}

const DossierUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  summary: z.string().nullable().optional(),
  status: z.enum(["OPEN", "SUBMITTED", "APPROVED", "REJECTED", "ARCHIVED"]).optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await ensureAuth(req);
  if (unauthorized) return unauthorized;

  const json = await req.json().catch(() => null);
  const parsed = DossierUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const updated = await prisma.dossier.update({
    where: { id: params.id },
    data: parsed.data,
  }).catch(() => null);
  if (!updated) return new Response("Not found", { status: 404 });
  return Response.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await ensureAuth(req);
  if (unauthorized) return unauthorized;

  const deleted = await prisma.dossier.delete({ where: { id: params.id } }).catch(() => null);
  if (!deleted) return new Response("Not found", { status: 404 });
  return new Response(null, { status: 204 });
}

