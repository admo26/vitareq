import { prisma } from "@/lib/prisma";
import { ensureAuth } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: Request) {
  const unauthorized = await ensureAuth(req);
  if (unauthorized) return unauthorized;

  const items = await prisma.risk.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(items);
}

const RiskCreateSchema = z.object({
  name: z.string().min(1),
  summary: z.string().nullable().optional(),
  status: z.enum(["OPEN", "SUBMITTED", "IN_PROGRESS", "TO_DO", "DONE", "APPROVED", "REJECTED", "ARCHIVED"]).optional(),
});

export async function POST(req: Request) {
  const unauthorized = await ensureAuth(req);
  if (unauthorized) return unauthorized;

  const json = await req.json().catch(() => null);
  const parsed = RiskCreateSchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const created = await prisma.risk.create({
    data: {
      name: parsed.data.name,
      summary: parsed.data.summary,
      status: parsed.data.status ?? "OPEN",
    },
  });
  return Response.json(created, { status: 201 });
}


