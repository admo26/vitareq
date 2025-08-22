"use client";
import { useEffect, useState } from "react";
// Replacing Atlaskit Heading to avoid type mismatch in this prototype
import Button from "@atlaskit/button";
import TextField from "@atlaskit/textfield";
import TextArea from "@atlaskit/textarea";
import SectionMessage from "@atlaskit/section-message";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

type Requirement = {
  id: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "ARCHIVED";
  createdAt: string;
};

export default function RequirementsPage() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [items, setItems] = useState<Requirement[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      .get<Requirement>("/api/requirements", { headers })
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
      .post("/api/requirements", { title, description }, { headers })
      .catch((e) => {
        setError(e?.response?.data?.error ?? e.message);
        return null;
      });
    if (res) {
      setTitle("");
      setDescription("");
      load();
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Requirements</h2>
      {error && (
        <div style={{ marginTop: 12 }}>
          <SectionMessage appearance="error">{error}</SectionMessage>
        </div>
      )}
      <div style={{ display: "grid", gap: 12, maxWidth: 560, marginTop: 16 }}>
        <TextField
          name="title"
          value={title}
          onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
          placeholder="Title"
        />
        <TextArea
          name="description"
          value={description}
          onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
          placeholder="Description"
        />
        <Button appearance="primary" onClick={create} isDisabled={!title.trim()}>
          Create requirement
        </Button>
      </div>

      <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
        {items.map((r) => (
          <div key={r.id} style={{ border: "1px solid #EBECF0", padding: 12, borderRadius: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{r.title}</strong>
              <Button appearance="subtle" onClick={async () => {
                await axios.delete(`/api/requirements/${r.id}`).catch((e) => setError(e?.response?.data?.error ?? e.message));
                load();
              }}>Delete</Button>
            </div>
            {r.description && <div style={{ marginTop: 4 }}>{r.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

