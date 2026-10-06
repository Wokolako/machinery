import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import s from "@/components/sections.module.css";
import { getSite } from "@/lib/api";

export default async function NotFound() {
  const { pages } = await getSite();

  return (
    <>
      <PageIntro title="There's no page at this address.">
        <p>
          The link may be out of date. Pick a page below, or go back to the{" "}
          <Link href="/" className={s.textLink}>
            overview
          </Link>
          .
        </p>
      </PageIntro>
      <section className={s.section} aria-label="Pages">
        <ul className={s.index}>
          {pages
            .filter((p) => p.inSequence)
            .map((p) => (
              <li key={p.slug} className={s.indexItem}>
                <Link href={p.path} className={s.indexLink}>
                  <span className={s.indexLabel}>{p.label}</span>
                  <span className={s.indexSummary}>{p.summary}</span>
                  <span className={s.indexGo} aria-hidden="true">
                    Open
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
