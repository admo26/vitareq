"use client";
import { useEffect, useState } from "react";
// Replacing Atlaskit Heading to avoid type mismatch in this prototype
import Button from "@atlaskit/button";
import SectionMessage from "@atlaskit/section-message";
import Lozenge from "@atlaskit/lozenge";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Skeleton from "@atlaskit/skeleton";

type Dossier = {
  id: string;
  name: string;
  summary?: string | null;
  status: "OPEN" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ARCHIVED";
  createdAt: string;
};

export default function DossiersPage() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [items, setItems] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
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
      .get<Dossier>("/api/dossiers", { headers })
      .catch(async (e) => {
        const status = e?.response?.status;
        if (status === 401 && !isAuthenticated) {
          try {
            await loginWithRedirect();
          } catch {}
        } else {
          setError(e?.response?.data?.error ?? e.message);
        }
        return null;
      });
    if (res) {
      setError(null);
      setItems(res.data as any);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [isAuthenticated]);

  async function create() { /* removed: now using modal */ }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Dossiers</h2>
      {error && (
        <div style={{ marginTop: 12 }}>
          <SectionMessage appearance="error">{error}</SectionMessage>
        </div>
      )}

      <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
        {loading ? (
          <>
            <Skeleton height={72} />
            <Skeleton height={72} />
            <Skeleton height={72} />
          </>
        ) : items.map((r) => (
          <div key={r.id} style={{ border: "1px solid #EBECF0", padding: 12, borderRadius: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong>{r.name}</strong>
                <Lozenge appearance={
                  r.status === "APPROVED" ? "success" :
                  r.status === "OPEN" ? "new" :
                  r.status === "SUBMITTED" ? "inprogress" :
                  r.status === "REJECTED" ? "removed" : "default"
                }>
                  {r.status === "OPEN" ? "Open" :
                   r.status === "SUBMITTED" ? "Submitted" :
                   r.status === "APPROVED" ? "Approved" :
                   r.status === "REJECTED" ? "Rejected" :
                   "Archived"}
                </Lozenge>
              </div>
              <Button appearance="subtle" onClick={async () => {
                await axios.delete(`/api/dossiers/${r.id}`).catch((e) => setError(e?.response?.data?.error ?? e.message));
                load();
              }}>Delete</Button>
            </div>
            {r.summary && <div style={{ marginTop: 4 }}>{r.summary}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

