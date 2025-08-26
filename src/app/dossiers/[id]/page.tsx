"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import SectionMessage from "@atlaskit/section-message";
import Button from "@atlaskit/button";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import Skeleton from "@atlaskit/skeleton";
import Lozenge from "@atlaskit/lozenge";
import axios from "axios";

type Dossier = {
  id: string;
  name: string;
  summary?: string | null;
  status: "OPEN" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ARCHIVED";
  createdAt: string;
};

export default function DossierDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [item, setItem] = useState<Dossier | null>(null);
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
        .get<Dossier>(`/api/dossiers/${params.id}`, { headers })
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

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Breadcrumbs>
          <BreadcrumbsItem href="/" text="Dashboard" />
          <BreadcrumbsItem href="/dossiers" text="Dossiers" />
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
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong style={{ fontSize: 18 }}>{item.name}</strong>
            <Lozenge appearance={
              item.status === "APPROVED" ? "success" :
              item.status === "OPEN" ? "new" :
              item.status === "SUBMITTED" ? "inprogress" :
              item.status === "REJECTED" ? "removed" : "default"
            }>
              {item.status === "OPEN" ? "Open" :
               item.status === "SUBMITTED" ? "Submitted" :
               item.status === "APPROVED" ? "Approved" :
               item.status === "REJECTED" ? "Rejected" :
               "Archived"}
            </Lozenge>
          </div>
          {item.summary && <div>{item.summary}</div>}
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
                await axios.delete(`/api/dossiers/${item.id}`, { headers });
                router.push("/dossiers");
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


