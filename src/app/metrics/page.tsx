import type { Metadata } from "next";
import Link from "next/link";
import NextPage from "@/components/NextPage";
import PageIntro from "@/components/PageIntro";
import s from "@/components/sections.module.css";
import { getDemoShift, getMetrics, getPage, section } from "@/lib/api";
import { computeShift, maxGoodKg, type ShiftParams } from "@/lib/shift";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("metrics");
  return { title: page.label, description: page.summary };
}

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const fmt1 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const fmt2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default async function Metrics() {
  const [page, metrics, demo] = await Promise.all([
    getPage("metrics"),
    getMetrics(),
    getDemoShift(),
  ]);
  const example = section(page, "example");

  const params: ShiftParams = {
    inputKg: demo.inputKg,
    inputValue: demo.inputValue,
    bandLow: demo.bandLow,
    bandHigh: demo.bandHigh,
    hoursRun: demo.shift.hoursRun,
    wasteKg: demo.shift.wasteKg,
    premiumPrice: demo.prices.premium,
    commercialPrice: demo.prices.commercial,
    meanPremiumShare: demo.meanPremiumShare,
  };
  const base = computeShift(params, demo.shift.goodKg, demo.shift.premiumKg);
  // What if every good kilogram had been logged as premium?
  const allGood = maxGoodKg(params);
  const high = computeShift(params, allGood, allGood);
  const position =
    base.bandPosition < 0 ? "below" : base.bandPosition > 1 ? "above" : "inside";

  return (
    <>
      <PageIntro page={page} />

      <section className={s.section} aria-labelledby="metrics-title">
        <h2 id="metrics-title" className="visually-hidden">
          Metrics
        </h2>
        <dl className={s.defList}>
          {metrics.map((m) => (
            <div key={m.code} className={s.defRow}>
              <dt>{m.name}</dt>
              <dd>{m.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${s.section} ${s.sectionPaper}`} aria-labelledby="example-title">
        <div className={s.example}>
          <div>
            <h2 id="example-title" className={s.h2}>
              {example.title}
            </h2>
            <p className={s.body}>
              The supervisor scoped {fmt.format(demo.inputKg)} kg of{" "}
              {demo.material.toLowerCase()} valued at {fmt.format(demo.inputValue)},
              with an expected band of {demo.bandLow}× to {demo.bandHigh}×. At
              shift close the operator reports {base.premiumKg} kg premium at{" "}
              {fmt.format(params.premiumPrice)} per kg, {base.commercialKg} kg
              commercial at {fmt.format(params.commercialPrice)}, {base.rejectKg} kg
              reject and {params.wasteKg} kg waste over {params.hoursRun} hours.
            </p>
            <p className={s.body}>
              If the same shift had reported all {high.premiumKg} kg as premium,
              the multiplier would be {fmt1.format(high.multiplier)}× and the band
              position {fmt2.format(high.bandPosition)}. The shift would be flagged
              above the band for the approver, not celebrated.
            </p>
            <p className={s.small}>
              <Link href="/" className={s.textLink}>
                Try it yourself on the live shift record
              </Link>
            </p>
          </div>

          <div className={s.ticket}>
            <p className={s.ticketTitle}>
              Shift close {demo.shift.logId}, {demo.machine.assetCode} {demo.machine.name}
            </p>
            <dl className={s.ticketRows}>
              <div>
                <dt>Output value</dt>
                <dd>{fmt.format(base.outputValue)}</dd>
              </div>
              <div>
                <dt>Multiplier</dt>
                <dd>{fmt1.format(base.multiplier)}×</dd>
              </div>
              <div>
                <dt>Band position</dt>
                <dd>
                  {fmt2.format(base.bandPosition)}, {position}
                </dd>
              </div>
              <div>
                <dt>Yield</dt>
                <dd>{fmt.format(base.yieldPct)}%</dd>
              </div>
              <div>
                <dt>Gross margin</dt>
                <dd>{fmt.format(base.grossMargin)}</dd>
              </div>
              <div>
                <dt>Value per hour</dt>
                <dd>{fmt.format(base.valuePerHour)}</dd>
              </div>
              <div>
                <dt>Waste value</dt>
                <dd>{fmt.format(base.wasteValue)}</dd>
              </div>
            </dl>
            {example.note && <p className={s.caption}>{example.note}</p>}
          </div>
        </div>
      </section>

      <NextPage current="metrics" />
    </>
  );
}
