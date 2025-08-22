"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import Button from "@atlaskit/button";

export function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  return (
    <>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 12,
        borderBottom: "1px solid #EBECF0",
      }}>
        <Link href="/" style={{ fontWeight: 600 }}>Vitareq</Link>
        <Link href="/requirements">Requirements</Link>
        <Link href="/dossiers">Dossiers</Link>
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
    </>
  );
}

export default AppShell;

