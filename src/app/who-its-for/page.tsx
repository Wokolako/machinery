import type { Metadata } from "next";
import NextPage from "@/components/NextPage";
import PageIntro from "@/components/PageIntro";
import s from "@/components/sections.module.css";
import { getCommercial, getPage, getRoles, section } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("who-its-for");
  return { title: page.label, description: page.summary };
}

export default async function WhoItsFor() {
  const [page, roles, commercial] = await Promise.all([
    getPage("who-its-for"),
    getRoles(),
    getCommercial(),
  ]);
  const rolesCopy = section(page, "roles");
  const terms = section(page, "terms");

  return (
    <>
      <PageIntro page={page} />

      <section className={s.section} aria-labelledby="roles-title">
        <h2 id="roles-title" className="visually-hidden">
          Roles
        </h2>
        <dl className={s.roles}>
          {roles.map((r) => (
            <div key={r.code} className={s.roleRow}>
              <dt>{r.name}</dt>
              <dd>{r.body}</dd>
            </div>
          ))}
        </dl>
        {rolesCopy.note && <p className={s.small}>{rolesCopy.note}</p>}
      </section>

      <section className={`${s.section} ${s.sectionPaper}`} aria-labelledby="terms-title">
        <div className={s.sectionHead}>
          <h2 id="terms-title" className={s.h2}>
            {terms.title}
          </h2>
          <p className={s.lead}>{terms.lead}</p>
        </div>
        <dl className={s.defList}>
          {commercial.map((c) => (
            <div key={c.code} className={s.defRow}>
              <dt>{c.name}</dt>
              <dd>{c.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <NextPage current="who-its-for" />
    </>
  );
}
