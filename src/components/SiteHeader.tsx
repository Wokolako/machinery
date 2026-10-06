"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SitePage } from "@/lib/api";
import styles from "./SiteHeader.module.css";

type Props = {
  pages: SitePage[];
};

export default function SiteHeader({ pages }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // The pilot page has its own button; Overview is reached through the wordmark.
  const navPages = pages.filter((p) => p.inSequence && p.slug !== "pilot");
  const pilot = pages.find((p) => p.slug === "pilot");
  const home = pages.find((p) => p.slug === "home");

  // Close the phone menu whenever the route changes.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isCurrent = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <header className={styles.header} data-open={open}>
      <div className={styles.bar}>
        <Link href="/" className={styles.wordmark} aria-label="AssetYield home">
          Asset<span>Yield</span>
        </Link>

        <nav aria-label="Main" className={styles.desktopNav}>
          <ul>
            {navPages.map((p) => (
              <li key={p.slug}>
                <Link
                  href={p.path}
                  className={styles.link}
                  aria-current={isCurrent(p.path) ? "page" : undefined}
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {pilot && (
          <Link
            href={pilot.path}
            className={styles.cta}
            aria-current={isCurrent(pilot.path) ? "page" : undefined}
          >
            Request a pilot
          </Link>
        )}

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="phone-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className={styles.menuIcon} aria-hidden="true" />
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <nav id="phone-menu" aria-label="Main" className={styles.phoneNav} hidden={!open}>
        <ul>
          {home && (
            <li>
              <Link
                href={home.path}
                className={styles.phoneLink}
                aria-current={isCurrent(home.path) ? "page" : undefined}
              >
                {home.label}
              </Link>
            </li>
          )}
          {navPages.map((p) => (
            <li key={p.slug}>
              <Link
                href={p.path}
                className={styles.phoneLink}
                aria-current={isCurrent(p.path) ? "page" : undefined}
              >
                {p.label}
                <span className={styles.phoneSummary}>{p.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
        {pilot && (
          <Link href={pilot.path} className={styles.phoneCta}>
            Request a pilot
          </Link>
        )}
      </nav>
    </header>
  );
}
