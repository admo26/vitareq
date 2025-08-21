"use client";
import { Auth0Provider } from "@auth0/auth0-react";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export default function AuthProvider({ children }: Props) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "";
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || "";
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || "";

  const redirectUri = typeof window !== "undefined" ? window.location.origin : undefined;

  if (!domain || !clientId) {
    // Render children even if not configured, to allow SKIP_AUTH server-side
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        audience: audience || undefined,
        redirect_uri: redirectUri,
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}

