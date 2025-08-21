import { prisma } from "@/lib/prisma";
import { ensureAuth } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: Request) {
  const unauthorized = await ensureAuth(req);
  if (unauthorized) return unauthorized;

  const items = await prisma.requirement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(items);
}

const RequirementCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "ARCHIVED"]).optional(),
  dossierId: z.string().optional(),
});

export async function POST(req: Request) {
  const unauthorized = await ensureAuth(req);
  if (unauthorized) return unauthorized;

  const json = await req.json().catch(() => null);
  const parsed = RequirementCreateSchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const created = await prisma.requirement.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status ?? "DRAFT",
      dossierId: parsed.data.dossierId,
    },
  });
  return Response.json(created, { status: 201 });
}

