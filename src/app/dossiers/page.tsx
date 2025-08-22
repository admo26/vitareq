"use client";
import { useEffect, useState } from "react";
// Replacing Atlaskit Heading to avoid type mismatch in this prototype
import Button from "@atlaskit/button";
import TextField from "@atlaskit/textfield";
import TextArea from "@atlaskit/textarea";
import SectionMessage from "@atlaskit/section-message";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

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
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
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
  }

  useEffect(() => {
    load();
  }, [isAuthenticated]);

  async function create() {
    setError(null);
    let headers: Record<string, string> = {};
    try {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE },
        });
        headers = { Authorization: `Bearer ${token}` };
      } else {
        await loginWithRedirect();
        return;
      }
    } catch {}
    const res = await axios
      .post("/api/dossiers", { name, summary }, { headers })
      .catch((e) => {
        setError(e?.response?.data?.error ?? e.message);
        return null;
      });
    if (res) {
      setName("");
      setSummary("");
      load();
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Dossiers</h2>
      {error && (
        <div style={{ marginTop: 12 }}>
          <SectionMessage appearance="error">{error}</SectionMessage>
        </div>
      )}
      <div style={{ display: "grid", gap: 12, maxWidth: 560, marginTop: 16 }}>
        <TextField
          name="name"
          value={name}
          onChange={(e) => setName((e.target as HTMLInputElement).value)}
          placeholder="Name"
        />
        <TextArea
          name="summary"
          value={summary}
          onChange={(e) => setSummary((e.target as HTMLTextAreaElement).value)}
          placeholder="Summary"
        />
        <Button appearance="primary" onClick={create} isDisabled={!name.trim()}>
          Create dossier
        </Button>
      </div>

      <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
        {items.map((r) => (
          <div key={r.id} style={{ border: "1px solid #EBECF0", padding: 12, borderRadius: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{r.name}</strong>
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

