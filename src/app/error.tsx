"use client";

import s from "@/components/sections.module.css";
import parts from "@/components/PageParts.module.css";

// Shown when a page's data can't be loaded, usually because the API or the
// database isn't running.
export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={parts.intro}>
      <h1 className={parts.introTitle}>This page couldn&apos;t load its data.</h1>
      <div className={parts.introBody}>
        <p>
          The site reads everything from the AssetYield API. Check that the API is
          running (<code>npm run dev</code> in the assetyield-api folder) and that
          PostgreSQL 13 is up, then try again.
        </p>
        {process.env.NODE_ENV === "development" && <p>{error.message}</p>}
        <p>
          <button type="button" className={s.buttonPrimary} onClick={reset}>
            Try again
          </button>
        </p>
      </div>
    </div>
  );
}
