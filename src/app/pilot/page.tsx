import type { Metadata } from "next";
import NextPage from "@/components/NextPage";
import PageIntro from "@/components/PageIntro";
import PilotForm from "@/components/PilotForm";
import s from "@/components/sections.module.css";
import { getPage, getPilotChecklist, section } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("pilot");
  return { title: "Request a pilot", description: page.summary };
}

export default async function Pilot() {
  const [page, checklist] = await Promise.all([getPage("pilot"), getPilotChecklist()]);
  const covers = section(page, "covers");
  const asks = section(page, "asks");

  return (
    <>
      <PageIntro page={page} />

      <section className={s.section} aria-labelledby="pilot-covers">
        <div className={s.pilotGrid}>
          <div>
            <h2 id="pilot-covers" className={s.h2}>
              {covers.title}
            </h2>
            <ul className={s.checklist}>
              {checklist
                .filter((c) => c.list === "covers")
                .map((c) => (
                  <li key={c.body}>{c.body}</li>
                ))}
            </ul>

            <h2 className={s.h2}>{asks.title}</h2>
            <ul className={s.checklist}>
              {checklist
                .filter((c) => c.list === "asks")
                .map((c) => (
                  <li key={c.body}>{c.body}</li>
                ))}
            </ul>
          </div>

          <PilotForm copy={section(page, "form")} />
        </div>
      </section>

      <NextPage current="pilot" />
    </>
  );
}
