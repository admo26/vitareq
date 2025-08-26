import { prisma } from "@/lib/prisma";
import { ensureAuth } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await ensureAuth(req);
  if (unauthorized) return unauthorized;

  const item = await prisma.requirement.findUnique({ where: { id: params.id } });
  if (!item) return new Response("Not found", { status: 404 });
  const { origin } = new URL(req.url);
  return Response.json({
    ...item,
    url: `${origin}/api/requirements/${item.id}`,
    web_url: `${origin}/requirements/${item.id}`,
  });
}

const RequirementUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "ARCHIVED"]).optional(),
  dossierId: z.string().nullable().optional(),
  requirementNumber: z
    .string()
    .regex(/^[A-Z]+-\d+$/i, "Invalid requirement number format (e.g. ABC-123)")
    .optional(),
  owner: z.string().min(1).optional(),
  dueDate: z.coerce.date().optional(),
  jiraKey: z.string().regex(/^[A-Z]+-\d+$/i).nullable().optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await ensureAuth(req);
  if (unauthorized) return unauthorized;

  const json = await req.json().catch(() => null);
  const parsed = RequirementUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const updated = await prisma.requirement.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        requirementNumber: parsed.data.requirementNumber?.toUpperCase(),
        jiraKey: parsed.data.jiraKey === null ? null : parsed.data.jiraKey?.toUpperCase(),
      },
    });
    const { origin } = new URL(req.url);
    return Response.json({
      ...updated,
      url: `${origin}/api/requirements/${updated.id}`,
      web_url: `${origin}/requirements/${updated.id}`,
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return new Response(JSON.stringify({ error: "Requirement number must be unique" }), {
          status: 409,
          headers: { "content-type": "application/json" },
        });
      }
      if (e.code === "P2025") {
        return new Response("Not found", { status: 404 });
      }
    }
    return new Response(JSON.stringify({ error: "Failed to update requirement" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await ensureAuth(req);
  if (unauthorized) return unauthorized;

  const deleted = await prisma.requirement.delete({ where: { id: params.id } }).catch(() => null);
  if (!deleted) return new Response("Not found", { status: 404 });
  return new Response(null, { status: 204 });
}

