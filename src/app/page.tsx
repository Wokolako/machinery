import Link from "next/link";
import ShiftRecord from "@/components/ShiftRecord";
import s from "@/components/sections.module.css";
import { getDemoShift, getPage, getSite, getSteps, getTiers, section } from "@/lib/api";

export default async function Home() {
  const [page, site, steps, tiers, demo] = await Promise.all([
    getPage("home"),
    getSite(),
    getSteps(),
    getTiers(),
    getDemoShift(),
  ]);
  const hero = section(page, "hero");
  const rule = section(page, "rule");
  const tierSection = section(page, "tiers");
  const index = section(page, "index");
  const cta = section(page, "cta");
  const sequence = site.pages.filter((p) => p.inSequence);

  return (
    <>
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={s.heroText}>
          <h1 id="hero-title" className={s.heroTitle}>
            {hero.title}
          </h1>
          <p className={s.heroLede}>{hero.lead}</p>
          <div className={s.heroActions}>
            <Link href="/pilot" className={s.buttonPrimary}>
              Request a pilot
            </Link>
            <Link href="/how-it-works" className={s.buttonText}>
              See how a shift is checked
            </Link>
          </div>
          {hero.note && <p className={s.heroHint}>{hero.note}</p>}
        </div>
        <div className={s.heroRecord}>
          <ShiftRecord data={demo} tiers={tiers} />
          <p className={s.caption}>{site.settings.disclaimer}</p>
        </div>
      </section>

      <section className={`${s.section} ${s.sectionPaper}`} aria-labelledby="rule-title">
        <div className={s.sectionHead}>
          <h2 id="rule-title" className={s.h2}>
            {rule.title}
          </h2>
          <p className={s.lead}>{rule.lead}</p>
        </div>
        <ol className={s.steps}>
          {steps.map((step) => (
            <li key={step.order} className={s.step}>
              <span className={s.stepNum} aria-hidden="true">
                {step.order}
              </span>
              <h3 className={s.h3}>{step.title}</h3>
              <p>{step.short}</p>
            </li>
          ))}
        </ol>
        <p className={s.small}>
          <Link href="/how-it-works" className={s.textLink}>
            Read how a shift is logged and checked
          </Link>
        </p>
      </section>

      <section className={s.section} aria-labelledby="tiers-title">
        <div className={s.sectionHead}>
          <h2 id="tiers-title" className={s.h2}>
            {tierSection.title}
          </h2>
          <p className={s.lead}>{tierSection.lead}</p>
        </div>
        <ol className={s.stampStrip} aria-label="Evidence tiers, lowest to highest">
          {tiers.map((t) => (
            <li key={t.code}>
              <span className={s.stamp} data-tier={t.code}>
                {t.name}
              </span>
            </li>
          ))}
        </ol>
        <p className={s.small}>
          <Link href="/evidence" className={s.textLink}>
            See the tiers and what gets flagged
          </Link>
        </p>
      </section>

      <section className={`${s.section} ${s.sectionPaper}`} aria-labelledby="index-title">
        <h2 id="index-title" className={s.h2}>
          {index.title}
        </h2>
        <ul className={s.index}>
          {sequence.map((p) => (
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

      <section className={s.cta} aria-labelledby="cta-title">
        <h2 id="cta-title" className={s.ctaTitle}>
          {cta.title}
        </h2>
        <p className={s.ctaBody}>{cta.body}</p>
        <Link href="/pilot" className={s.buttonOnBlue}>
          Request a pilot
        </Link>
      </section>
    </>
  );
}
