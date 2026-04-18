import { useCallback, useMemo, useState } from "react";
import { SectionCard } from "../components/SectionCard";
import { RealtimeChart } from "../features/dashboard/RealtimeChart";
import { TrainingForm } from "../features/dashboard/TrainingForm";
import { EducationPanel } from "../features/education/EducationPanel";
import { ExperimentTable } from "../features/experiments/ExperimentTable";
import { InferencePanel } from "../features/inference/InferencePanel";
import { useTrainingSocket } from "../hooks/useTrainingSocket";
import type { Experiment, TrainingEvent } from "../types";

const defaultExperiments: Experiment[] = [
  { id: 1, name: "Golden Falcon", model_family: "llm", algorithm: "qlora", status: "running", params: {}, metrics: {} },
  { id: 2, name: "Atlas Baseline", model_family: "classical", algorithm: "random_forest", status: "completed", params: {}, metrics: {} },
  { id: 3, name: "Mercury Eval", model_family: "classical", algorithm: "mlp", status: "completed", params: {}, metrics: {} }
];

export function DashboardPage() {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [liveExperimentId, setLiveExperimentId] = useState<number | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>(defaultExperiments);

  const latest = events.length > 0 ? events[events.length - 1] : undefined;
  const kpis = useMemo(
    () => [
      { label: "Live Accuracy", value: latest ? `${(latest.accuracy * 100).toFixed(1)}%` : "--" },
      { label: "Current Loss", value: latest ? latest.loss.toFixed(3) : "--" },
      { label: "Running Experiments", value: `${experiments.filter((e) => e.status === "running").length}` }
    ],
    [events, experiments]
  );

  const handleComplete = useCallback(() => {
    setExperiments((existing) =>
      existing.map((item) => (item.status === "running" ? { ...item, status: "completed" } : item))
    );
  }, []);

  useTrainingSocket(liveExperimentId, (event) => setEvents((existing) => [...existing, event]), handleComplete);

  return (
    <main className="layout">
      <div className="hero-glow" />
      <header className="hero">
        <h1>Interactive AI Trainer Command Center</h1>
        <p>Elegant live experimentation dashboard for ML and LLM workflows.</p>
      </header>

      <section className="kpi-row">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="kpi-card floaty">
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
          </article>
        ))}
      </section>

      <div className="grid">
        <SectionCard>
          <TrainingForm
            onExperimentCreated={(id) => {
              setEvents([]);
              setLiveExperimentId(id);
              setExperiments((existing) => [
                { id, name: "Live Session", model_family: "llm", algorithm: "qlora", status: "running", params: {}, metrics: {} },
                ...existing
              ]);
            }}
          />
        </SectionCard>
        <SectionCard>
          <h3>Realtime Telemetry</h3>
          <RealtimeChart events={events} />
        </SectionCard>
        <SectionCard>
          <ExperimentTable experiments={experiments} />
        </SectionCard>
        <SectionCard>
          <InferencePanel />
        </SectionCard>
        <SectionCard>
          <EducationPanel />
        </SectionCard>
      </div>

<footer className="dashboard-footer" style={{ textAlign: "center" }}>
  <p>Disclaimer: For demo purposes only.</p>
  <p>
    <a
      href="https://github.com/alexasamoah/ai-trainer-dashboard"
      target="_blank"
      rel="noreferrer"
    >
      View source code
    </a>
  </p>
</footer>
    </main>
  );
}
