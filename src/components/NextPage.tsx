import Link from "next/link";
import { getSite } from "@/lib/api";
import styles from "./PageParts.module.css";

type Props = {
  current: string;
};

export default async function NextPage({ current }: Props) {
  const { pages } = await getSite();
  const sequence = pages.filter((p) => p.inSequence);
  const i = sequence.findIndex((p) => p.slug === current);
  const prev = i > 0 ? sequence[i - 1] : pages.find((p) => p.slug === "home");
  const next = i >= 0 ? sequence[i + 1] : undefined;

  return (
    <nav className={styles.pager} aria-label="Pages">
      {prev && (
        <Link href={prev.path} className={styles.pagerLink} data-dir="prev">
          <span className={styles.pagerDir}>Previous</span>
          <span className={styles.pagerLabel}>{prev.label}</span>
        </Link>
      )}
      {next && (
        <Link href={next.path} className={styles.pagerLink} data-dir="next">
          <span className={styles.pagerDir}>Next</span>
          <span className={styles.pagerLabel}>{next.label}</span>
          <span className={styles.pagerSummary}>{next.summary}</span>
        </Link>
      )}
    </nav>
  );
}
