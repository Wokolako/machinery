"use client";

import { useId, useState } from "react";
import type { DemoShift, Tier as TierRow } from "@/lib/api";
import { computeShift, maxGoodKg, type ShiftParams } from "@/lib/shift";
import styles from "./ShiftRecord.module.css";

type Tier = "logged" | "approved" | "corroborated";

type Props = {
  data: DemoShift;
  tiers: TierRow[];
};

const AXIS_MAX = 30;
const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const fmt1 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const fmt2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pct = (x: number) => `${(Math.min(Math.max(x, 0), AXIS_MAX) / AXIS_MAX) * 100}%`;

export default function ShiftRecord({ data, tiers }: Props) {
  const params: ShiftParams = {
    inputKg: data.inputKg,
    inputValue: data.inputValue,
    bandLow: data.bandLow,
    bandHigh: data.bandHigh,
    hoursRun: data.shift.hoursRun,
    wasteKg: data.shift.wasteKg,
    premiumPrice: data.prices.premium,
    commercialPrice: data.prices.commercial,
    meanPremiumShare: data.meanPremiumShare,
  };
  const tierLabel = Object.fromEntries(tiers.map((t) => [t.code, t.name]));

  const [goodKg, setGoodKg] = useState(data.shift.goodKg);
  const [premiumKg, setPremiumKg] = useState(data.shift.premiumKg);
  const [tier, setTier] = useState<Tier>("logged");
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState(false);
  const id = useId();

  const m = computeShift(params, goodKg, premiumKg);
  const locked = tier !== "logged";
  const needsNote = m.flags.length > 0;

  function changeGood(value: number) {
    setGoodKg(value);
    if (premiumKg > value) setPremiumKg(value);
  }

  function approve() {
    if (needsNote && note.trim().length === 0) {
      setNoteError(true);
      return;
    }
    setNoteError(false);
    setTier("approved");
  }

  function reset() {
    setGoodKg(data.shift.goodKg);
    setPremiumKg(data.shift.premiumKg);
    setTier("logged");
    setNote("");
    setNoteError(false);
  }

  const bandState =
    m.bandPosition < 0 ? "below" : m.bandPosition > 1 ? "above" : "inside";

  return (
    <section className={styles.record} aria-labelledby={`${id}-title`}>
      <header className={styles.head}>
        <div>
          <h2 id={`${id}-title`} className={styles.title}>
            {data.shiftLabel}, {data.machine.assetCode} {data.machine.name}
          </h2>
          <p className={styles.sub}>
            {data.material}. Scope v{data.scopeVersion}, locked {data.lockedAt}.
            Input {fmt.format(data.inputKg)} kg valued {fmt.format(data.inputValue)}.
          </p>
        </div>
        <p className={styles.tier} data-tier={tier} aria-live="polite">
          {tierLabel[tier]}
        </p>
      </header>

      <div className={styles.gauge}>
        <div className={styles.gaugeHead}>
          <p className={styles.multiplier}>
            <span className={styles.multiplierValue}>{fmt1.format(m.multiplier)}×</span>
            <span className={styles.multiplierLabel}>
              output value over input value
            </span>
          </p>
          <p className={styles.bandNote} data-state={bandState}>
            {bandState === "inside"
              ? `Inside the band, position ${fmt2.format(m.bandPosition)}`
              : bandState === "below"
                ? `Below the band, position ${fmt2.format(m.bandPosition)}`
                : `Above the band, position ${fmt2.format(m.bandPosition)}`}
          </p>
        </div>
        <div className={styles.track} aria-hidden="true">
          <div
            className={styles.band}
            style={{ left: pct(data.bandLow), right: `calc(100% - ${pct(data.bandHigh)})` }}
          />
          <div
            className={styles.marker}
            data-state={bandState}
            style={{ left: pct(m.multiplier) }}
          />
        </div>
        <div className={styles.ticks} aria-hidden="true">
          {[0, 5, 10, 15, 20, 25, 30].map((t) => (
            <span key={t} style={{ left: pct(t) }}>
              {t}×
            </span>
          ))}
        </div>
        <p className={styles.bandLabel}>
          <span className={styles.bandSwatch} aria-hidden="true" />
          Supervisor&apos;s band for this scope: {data.bandLow}× to {data.bandHigh}×
        </p>
      </div>

      <fieldset className={styles.controls} disabled={locked}>
        <legend className={styles.legend}>
          {locked
            ? "Locked. A correction now needs a reopened batch with a reason."
            : "Shift close: drag to change what the operator reports"}
        </legend>
        <label className={styles.control}>
          <span className={styles.controlLabel}>
            Good output <strong>{goodKg} kg</strong>
          </span>
          <input
            type="range"
            min={0}
            max={maxGoodKg(params)}
            step={5}
            value={goodKg}
            onChange={(e) => changeGood(Number(e.target.value))}
          />
        </label>
        <label className={styles.control}>
          <span className={styles.controlLabel}>
            of which premium grade <strong>{m.premiumKg} kg</strong>
          </span>
          <input
            type="range"
            min={0}
            max={goodKg}
            step={5}
            value={m.premiumKg}
            onChange={(e) => setPremiumKg(Number(e.target.value))}
          />
        </label>
      </fieldset>

      <dl className={styles.metrics}>
        <div>
          <dt>Yield</dt>
          <dd>{fmt1.format(m.yieldPct)}%</dd>
        </div>
        <div>
          <dt>Gross margin</dt>
          <dd>{fmt.format(m.grossMargin)}</dd>
        </div>
        <div>
          <dt>Value per hour</dt>
          <dd>{fmt.format(m.valuePerHour)}</dd>
        </div>
        <div>
          <dt>Waste value</dt>
          <dd>{fmt.format(m.wasteValue)}</dd>
        </div>
      </dl>
      <p className={styles.split}>
        {m.premiumKg} kg premium at {fmt.format(params.premiumPrice)}, {m.commercialKg} kg
        commercial at {fmt.format(params.commercialPrice)}, {m.rejectKg} kg reject,{" "}
        {params.wasteKg} kg waste, {params.hoursRun} h run. Shift close log{" "}
        {data.shift.logId}.
      </p>

      {m.flags.length > 0 && (
        <ul className={styles.flags} aria-live="polite">
          {m.flags.map((f) => (
            <li key={f} className={styles.flag}>
              <span className={styles.flagCode}>{f}</span>
              {data.flagText[f]}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        {tier === "logged" && (
          <>
            {needsNote && (
              <label className={styles.noteField}>
                <span>Approver note (required for flagged shifts)</span>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    if (noteError) setNoteError(false);
                  }}
                  aria-invalid={noteError}
                  aria-describedby={noteError ? `${id}-note-error` : undefined}
                />
                {noteError && (
                  <span id={`${id}-note-error`} className={styles.error}>
                    Add a note explaining the flag before approving.
                  </span>
                )}
              </label>
            )}
            <button type="button" className={styles.primary} onClick={approve}>
              Approve shift
            </button>
          </>
        )}
        {tier === "approved" && (
          <button
            type="button"
            className={styles.primary}
            onClick={() => setTier("corroborated")}
          >
            Confirm receipt at destination
          </button>
        )}
        {tier === "corroborated" && (
          <p className={styles.done}>
            {data.destination} confirmed {goodKg} kg received, variance 0 kg.
            This shift can now count toward bonus.
          </p>
        )}
        {tier !== "logged" && (
          <button type="button" className={styles.secondary} onClick={reset}>
            Start over
          </button>
        )}
      </div>
    </section>
  );
}
