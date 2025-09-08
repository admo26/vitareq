"use client";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import Button from "@atlaskit/button";
import { useRouter } from "next/navigation";
import CreateEntityModal from "@/components/CreateEntityModal";
import TextField from "@atlaskit/textfield";

export function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect().catch(() => {});
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);
  const router = useRouter();
  if (isLoading || !isAuthenticated) {
    return null;
  }
  return (
    <>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 12,
        borderBottom: "1px solid #EBECF0",
        position: "relative",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
          <img src="/vitafleet-logo.png" alt="Vitafleet" style={{ height: 28, width: "auto", display: "block" }} />
          Vitareq
        </Link>
        <Link href="/requirements">Requirements</Link>
        <Link href="/risks">Risks</Link>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 260 }}>
            <TextField name="nav-search" placeholder="Search" />
          </div>
          <Button appearance="primary" onClick={() => setIsCreateOpen(true)}>+ Create</Button>
        </div>
        <div style={{ marginLeft: "auto" }}>
          {isAuthenticated ? (
            <Button
              appearance="subtle"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Sign out
            </Button>
          ) : (
            <Button
              appearance="primary"
              onClick={() => loginWithRedirect()}
              isDisabled={isLoading}
            >
              {isLoading ? "Loading…" : "Sign in"}
            </Button>
          )}
        </div>
      </div>
      {children}
      
      <CreateEntityModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        forceSimple={true}
        onCreated={(type) => {
          setIsCreateOpen(false);
          router.push(type === "requirement" ? "/requirements" : "/risks");
        }}
      />
    </>
  );
}

export default AppShell;

