"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "1rem", textAlign: "center", padding: "1rem" }}>
          <p style={{ fontWeight: 600 }}>Something went wrong</p>
          <p style={{ color: "#ef4444" }}>{error?.message}</p>
          <button onClick={reset} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
