import Link from "next/link";
import type { Site } from "@/lib/api";
import styles from "./PageParts.module.css";

type Props = {
  site: Site;
};

export default function SiteFooter({ site }: Props) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div>
          <p className={styles.footerMark}>
            Asset<span>Yield</span>
          </p>
          <p className={styles.footerLine}>{site.settings.tagline}</p>
        </div>
        <nav aria-label="Footer">
          <ul className={styles.footerLinks}>
            {site.pages.map((p) => (
              <li key={p.slug}>
                <Link href={p.path}>{p.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className={styles.footerSmall}>{site.settings.disclaimer}</p>
    </footer>
  );
}
