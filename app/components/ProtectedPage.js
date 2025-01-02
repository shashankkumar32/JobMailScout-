"use client";

import { useSession, signIn } from "next-auth/react";

export default function ProtectedPage({ children }) {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    signIn();
    return null;
  }

  return <>{children}</>;
}
