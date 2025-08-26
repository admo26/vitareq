"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import SectionMessage from "@atlaskit/section-message";
import Button from "@atlaskit/button";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import Skeleton from "@atlaskit/skeleton";
import Lozenge from "@atlaskit/lozenge";
import axios from "axios";

type Requirement = {
  id: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "ARCHIVED";
  createdAt: string;
  requirementNumber?: string | null;
  owner?: string | null;
  dueDate?: string | null;
  url?: string | null;
  jiraKey?: string | null;
};

export default function RequirementDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [item, setItem] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      setLoading(true);
      let headers: Record<string, string> = {};
      try {
        if (isAuthenticated) {
          const token = await getAccessTokenSilently({
            authorizationParams: { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE },
          });
          headers = { Authorization: `Bearer ${token}` };
        }
      } catch {}
      const res = await axios
        .get<Requirement>(`/api/requirements/${params.id}`, { headers })
        .catch(async (e) => {
          const status = e?.response?.status;
          if (status === 401 && !isAuthenticated) {
            try { await loginWithRedirect(); } catch {}
          } else {
            setError(e?.response?.data?.error ?? e.message);
          }
          return null;
        });
      if (res) {
        setError(null);
        setItem(res.data as any);
      }
      setLoading(false);
    }
    load();
  }, [params?.id, isAuthenticated, getAccessTokenSilently, loginWithRedirect]);

  const requirementStatusLabel: Record<Requirement["status"], string> = {
    DRAFT: "Draft",
    IN_REVIEW: "In review",
    APPROVED: "Approved",
    ARCHIVED: "Archived",
  };
  const requirementStatusAppearance: Record<Requirement["status"], "default" | "success" | "removed" | "inprogress" | "new" | "moved"> = {
    DRAFT: "new",
    IN_REVIEW: "inprogress",
    APPROVED: "success",
    ARCHIVED: "removed",
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Breadcrumbs>
          <BreadcrumbsItem href="/" text="Dashboard" />
          <BreadcrumbsItem href="/requirements" text="Requirements" />
          <BreadcrumbsItem text="Detail" />
        </Breadcrumbs>
      </div>
      {error && (
        <div style={{ marginTop: 12 }}>
          <SectionMessage appearance="error">{error}</SectionMessage>
        </div>
      )}

      {loading || !item ? (
        <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
          <Skeleton height={20} width="60%" />
          <Skeleton height={12} width="40%" />
          <Skeleton height={12} width="80%" />
          <Skeleton height={12} width="90%" />
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong style={{ fontSize: 18 }}>[{item.requirementNumber}] {item.title}</strong>
            <Lozenge appearance={requirementStatusAppearance[item.status]}>
              {requirementStatusLabel[item.status]}
            </Lozenge>
          </div>
          {item.owner && <div style={{ color: "#6B778C" }}>Owner: {item.owner}</div>}
          {item.dueDate && <div style={{ color: "#6B778C" }}>Due: {new Date(item.dueDate).toLocaleDateString()}</div>}
          {item.jiraKey && (
            <div>
              Jira: <a href={`https://jira.atlassian.com/browse/${item.jiraKey}`} target="_blank" rel="noreferrer">{item.jiraKey}</a>
            </div>
          )}
          {item.url && <div><a href={item.url} target="_blank" rel="noreferrer">Open resource</a></div>}
          {item.description && <div>{item.description}</div>}
          <div style={{ marginTop: 8 }}>
            <Button appearance="danger" onClick={async () => {
              try {
                let headers: Record<string, string> = {};
                if (isAuthenticated) {
                  const token = await getAccessTokenSilently({
                    authorizationParams: { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE },
                  });
                  headers = { Authorization: `Bearer ${token}` };
                } else {
                  await loginWithRedirect();
                  return;
                }
                await axios.delete(`/api/requirements/${item.id}`, { headers });
                router.push("/requirements");
              } catch (err: any) {
                setError(err?.response?.data?.error ?? err?.message ?? "Failed to delete");
              }
            }}>Delete</Button>
          </div>
        </div>
      )}
    </div>
  );
}


