import type { ReactNode } from "react";
import { paragraphs, type PageData } from "@/lib/api";
import styles from "./PageParts.module.css";

type Props =
  | { page: PageData; title?: never; children?: never }
  | { page?: never; title: string; children: ReactNode };

// Renders a page's title and intro, either from its database row or from props.
export default function PageIntro(props: Props) {
  const title = props.page ? (props.page.introTitle ?? props.page.label) : props.title;
  const body = props.page
    ? paragraphs(props.page.introBody).map((p) => <p key={p}>{p}</p>)
    : props.children;

  return (
    <div className={styles.intro}>
      <h1 className={styles.introTitle}>{title}</h1>
      <div className={styles.introBody}>{body}</div>
    </div>
  );
}
