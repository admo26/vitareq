import { prisma } from "@/lib/prisma";
import { ensureAuth } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";

export async function GET(req: Request) {
  const unauthorized = await ensureAuth(req);
  if (unauthorized) return unauthorized;

  const url = new URL(req.url);
  const jiraKeyParam = url.searchParams.get("jiraKey");
  const { origin } = url;

  if (jiraKeyParam) {
    const key = jiraKeyParam.toUpperCase();
    const item = await prisma.requirement.findFirst({ where: { jiraKey: key } });
    if (!item) return new Response("Not found", { status: 404 });
    return Response.json({
      ...item,
      url: `${origin}/api/requirements/${item.id}`,
      web_url: `${origin}/requirements/${item.id}`,
    });
  }

  const items = await prisma.requirement.findMany({
    orderBy: { createdAt: "desc" },
  });
  const withUrls = items.map((r) => ({
    ...r,
    url: `${origin}/api/requirements/${r.id}`,
    web_url: `${origin}/requirements/${r.id}`,
  }));
  return Response.json(withUrls);
}

const RequirementCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "ARCHIVED"]).optional(),
  riskId: z.string().nullable().optional(),
  requirementNumber: z
    .string()
    .regex(/^[A-Z]+-\d+$/i, "Invalid requirement number format (e.g. ABC-123)")
    .optional(),
  owner: z.string().min(1).optional(),
  dueDate: z.coerce.date().optional(),
  jiraKey: z.string().regex(/^[A-Z]+-\d+$/i).optional(),
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

  try {
    const created = await prisma.requirement.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status ?? "DRAFT",
        riskId: parsed.data.riskId,
        requirementNumber: parsed.data.requirementNumber?.toUpperCase(),
        owner: parsed.data.owner,
        dueDate: parsed.data.dueDate,
        jiraKey: parsed.data.jiraKey?.toUpperCase(),
      },
    });
    const { origin } = new URL(req.url);
    return Response.json(
      {
        ...created,
        url: `${origin}/api/requirements/${created.id}`,
        web_url: `${origin}/requirements/${created.id}`,
      },
      { status: 201 }
    );
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return new Response(JSON.stringify({ error: "Requirement number must be unique" }), {
          status: 409,
          headers: { "content-type": "application/json" },
        });
      }
    }
    return new Response(JSON.stringify({ error: "Failed to create requirement" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

