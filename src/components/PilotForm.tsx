"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { submitPilotRequest } from "@/app/pilot/actions";
import type { Section } from "@/lib/api";
import s from "./sections.module.css";

type Props = {
  copy: Section;
};

const fieldOrder = ["name", "company", "requesterKind", "machines", "sites", "notes"];

export default function PilotForm({ copy }: Props) {
  const id = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await submitPilotRequest(data);
      if (result.ok) {
        setErrors({});
        setSavedId(result.id);
        form.reset();
        return;
      }
      setSavedId(null);
      setErrors(result.errors);
      const first = fieldOrder.find((k) => result.errors[k]);
      if (first) document.getElementById(`${id}-${first}`)?.focus();
    });
  }

  const err = (k: string) =>
    errors[k] ? { "aria-invalid": true as const, "aria-describedby": `${id}-${k}-error` } : {};

  const errorText = (k: string) =>
    errors[k] ? (
      <span id={`${id}-${k}-error`} className={s.fieldError}>
        {errors[k]}
      </span>
    ) : null;

  return (
    <form
      className={s.form}
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={`${id}-title`}
      aria-busy={pending}
    >
      <h2 id={`${id}-title`} className={s.formTitle}>
        {copy.title}
      </h2>

      <label className={s.field}>
        <span className={s.fieldLabel}>Your name</span>
        <input id={`${id}-name`} name="name" className={s.input} autoComplete="name" maxLength={200} {...err("name")} />
        {errorText("name")}
      </label>

      <label className={s.field}>
        <span className={s.fieldLabel}>Company</span>
        <input
          id={`${id}-company`}
          name="company"
          className={s.input}
          autoComplete="organization"
          maxLength={200}
          {...err("company")}
        />
        {errorText("company")}
      </label>

      <fieldset className={s.radioGroup}>
        <legend>We are</legend>
        <label className={s.radio}>
          <input id={`${id}-requesterKind`} type="radio" name="requesterKind" value="partner" defaultChecked />
          A machinery supplier
        </label>
        <label className={s.radio}>
          <input type="radio" name="requesterKind" value="company" />
          A company running the machines
        </label>
        {errorText("requesterKind")}
      </fieldset>

      <label className={s.field}>
        <span className={s.fieldLabel}>Machine types and materials</span>
        {copy.note && <span className={s.fieldHint}>{copy.note}</span>}
        <textarea
          id={`${id}-machines`}
          name="machines"
          rows={3}
          maxLength={4000}
          className={s.input}
          {...err("machines")}
        />
        {errorText("machines")}
      </label>

      <label className={s.field}>
        <span className={s.fieldLabel}>Number of sites (optional)</span>
        <input id={`${id}-sites`} name="sites" inputMode="numeric" className={s.input} {...err("sites")} />
        {errorText("sites")}
      </label>

      <label className={s.field}>
        <span className={s.fieldLabel}>Anything else (optional)</span>
        <textarea id={`${id}-notes`} name="notes" rows={3} maxLength={4000} className={s.input} {...err("notes")} />
        {errorText("notes")}
      </label>

      <button type="submit" className={s.buttonPrimary} disabled={pending}>
        {pending ? "Sending request…" : "Request a pilot"}
      </button>

      <div role="status" aria-live="polite">
        {savedId ? (
          <p className={s.formDone}>
            {copy.body} Reference {savedId.slice(0, 8)}.
          </p>
        ) : errors.form ? (
          <p className={s.fieldError}>{errors.form}</p>
        ) : (
          copy.lead && <p className={s.formNote}>{copy.lead}</p>
        )}
      </div>
    </form>
  );
}
