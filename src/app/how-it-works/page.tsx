import type { Metadata } from "next";
import NextPage from "@/components/NextPage";
import PageIntro from "@/components/PageIntro";
import s from "@/components/sections.module.css";
import {
  getLedgerExample,
  getPage,
  getScopeRules,
  getSteps,
  getTimeline,
  paragraphs,
  section,
  type LedgerEntry,
} from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("how-it-works");
  return { title: page.label, description: page.summary };
}

const fmtQty = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function Entry({ entry, superseded }: { entry: LedgerEntry; superseded: boolean }) {
  return (
    <div className={s.entry} data-state={superseded ? "superseded" : undefined}>
      <p className={s.entryHead}>
        <span>
          Log {entry.id}
          {entry.supersedes ? `, replaces ${entry.supersedes}` : ""}
        </span>
        <span>{superseded ? "Superseded" : `Reason: ${entry.reason}`}</span>
      </p>
      <p className={s.entryLine}>
        Input {fmtQty.format(entry.inputQty)} {entry.inputUnit}
      </p>
      <p className={s.entryLine}>
        Output{" "}
        {entry.outputs.map((o) => `${o.grade.toLowerCase()} ${fmtQty.format(o.qtyKg)} kg`).join(", ")}
      </p>
    </div>
  );
}

export default async function HowItWorks() {
  const [page, timeline, steps, scopeRules, ledger] = await Promise.all([
    getPage("how-it-works"),
    getTimeline(),
    getSteps(),
    getScopeRules(),
    getLedgerExample(),
  ]);
  const pull = section(page, "pull");
  const scope = section(page, "scope");
  const ledgerCopy = section(page, "ledger");
  const { original, replacement } = ledger;
  const shortHash = `${replacement.prevHash.slice(0, 4)}…${replacement.prevHash.slice(-4)}`;

  return (
    <>
      <PageIntro page={page} />

      <section className={s.section} aria-labelledby="shift-title">
        <h2 id="shift-title" className="visually-hidden">
          One shift, start to finish
        </h2>
        <ol className={s.timeline} aria-label="One shift, start to finish">
          {timeline.map((t) => (
            <li key={t.time + t.label} className={s.tick} data-kind={t.kind}>
              <span className={s.tickTime}>{t.time}</span>
              <span className={s.tickLabel}>{t.label}</span>
            </li>
          ))}
        </ol>

        <ol className={s.steps}>
          {steps.map((step) => (
            <li key={step.order} className={s.step}>
              <span className={s.stepNum} aria-hidden="true">
                {step.order}
              </span>
              <h3 className={s.h3}>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        {pull.body && <p className={s.pullNote}>{pull.body}</p>}
      </section>

      <section className={`${s.section} ${s.sectionPaper}`} aria-labelledby="scope-title">
        <div className={s.sectionHead}>
          <h2 id="scope-title" className={s.h2}>
            {scope.title}
          </h2>
          <p className={s.lead}>{scope.lead}</p>
        </div>
        <dl className={s.defList}>
          {scopeRules.map((r) => (
            <div key={r.name} className={s.defRow}>
              <dt>{r.name}</dt>
              <dd>{r.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={s.section} aria-labelledby="ledger-title">
        <div className={s.split}>
          <div>
            <h2 id="ledger-title" className={s.h2}>
              {ledgerCopy.title}
            </h2>
            {paragraphs(ledgerCopy.body).map((p) => (
              <p key={p} className={s.body}>
                {p}
              </p>
            ))}
          </div>
          <figure className={s.ledger}>
            <figcaption className={s.ledgerCaption}>
              Interval log, {replacement.assetCode}, {replacement.from} to {replacement.to}
            </figcaption>
            <Entry entry={original} superseded />
            <Entry entry={replacement} superseded={false} />
            <p className={s.chain}>Chained to previous event {shortHash}</p>
          </figure>
        </div>
      </section>

      <NextPage current="how-it-works" />
    </>
  );
}
