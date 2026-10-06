import type { Metadata } from "next";
import NextPage from "@/components/NextPage";
import PageIntro from "@/components/PageIntro";
import s from "@/components/sections.module.css";
import { getFlags, getPage, getRoutes, getTiers, section } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("evidence");
  return { title: page.label, description: page.summary };
}

export default async function Evidence() {
  const [page, tiers, routes, flags] = await Promise.all([
    getPage("evidence"),
    getTiers(),
    getRoutes(),
    getFlags(),
  ]);
  const routesCopy = section(page, "routes");
  const flagsCopy = section(page, "flags");
  const benchmark = section(page, "benchmark");

  return (
    <>
      <PageIntro page={page} />

      <section className={s.section} aria-labelledby="tiers-title">
        <h2 id="tiers-title" className="visually-hidden">
          Evidence tiers
        </h2>
        <ol className={s.tiers}>
          {tiers.map((t) => (
            <li key={t.code} className={s.tierRow}>
              <p className={s.stamp} data-tier={t.code}>
                {t.name}
              </p>
              <p className={s.tierWho}>{t.who}</p>
              <p className={s.tierUse}>{t.use}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${s.section} ${s.sectionPaper}`} aria-labelledby="routes-title">
        <div className={s.sectionHead}>
          <h2 id="routes-title" className={s.h2}>
            {routesCopy.title}
          </h2>
          <p className={s.lead}>{routesCopy.lead}</p>
        </div>
        <dl className={s.routes}>
          {routes.map((r) => (
            <div key={r.code}>
              <dt>{r.name}</dt>
              <dd>{r.body}</dd>
            </div>
          ))}
        </dl>
        {routesCopy.note && <p className={s.small}>{routesCopy.note}</p>}
      </section>

      <section className={`${s.section} ${s.sectionInk}`} aria-labelledby="flags-title">
        <div className={s.sectionHead}>
          <h2 id="flags-title" className={s.h2}>
            {flagsCopy.title}
          </h2>
          <p className={s.lead}>{flagsCopy.lead}</p>
        </div>
        <table className={s.flagTable}>
          <caption className="visually-hidden">Flags and what happens next</caption>
          <thead>
            <tr>
              <th scope="col">Flag</th>
              <th scope="col">Raised when</th>
              <th scope="col">What happens</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((f) => (
              <tr key={f.code}>
                <th scope="row">
                  <span className={s.flagChip}>{f.code}</span>
                </th>
                <td>{f.raisedWhen}</td>
                <td>{f.effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {flagsCopy.note && <p className={s.smallOnInk}>{flagsCopy.note}</p>}
      </section>

      <section className={s.section} aria-labelledby="benchmark-title">
        <div className={s.sectionHead}>
          <h2 id="benchmark-title" className={s.h2}>
            {benchmark.title}
          </h2>
          <p className={s.lead}>{benchmark.lead}</p>
        </div>
      </section>

      <NextPage current="evidence" />
    </>
  );
}
