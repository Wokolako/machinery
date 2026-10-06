"use client";

// Replaces the whole layout when the layout itself fails, e.g. when the API is
// down and the navigation can't be loaded.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "1rem",
          background: "#e8ebec",
          color: "#1e2a32",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "36rem" }}>
          <h1 style={{ fontSize: "2rem", lineHeight: 1.1 }}>AssetYield can&apos;t load right now.</h1>
          <p style={{ marginTop: "1rem", lineHeight: 1.55 }}>
            The site reads everything from the AssetYield API. Check that the API is
            running (npm run dev in the assetyield-api folder) and that PostgreSQL 13
            is up, then try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p style={{ marginTop: "0.75rem", color: "#52616b" }}>{error.message}</p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              minHeight: "3rem",
              padding: "0 1.4rem",
              background: "#21418f",
              color: "#fbfcfc",
              border: 0,
              borderRadius: 4,
              font: "inherit",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
