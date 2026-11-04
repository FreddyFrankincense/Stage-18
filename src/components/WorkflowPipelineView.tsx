import React, { useState } from 'react';
import { STAGE_18_SPECS, WORKFLOW_STEPS, WorkflowStep } from '../data/stage18Data';
import {
  AlertTriangle,
  CheckSquare,
  Code2,
  Compass,
  Layers,
  RotateCcw,
  Square,
  Terminal,
} from 'lucide-react';

interface WorkflowPipelineViewProps {
  completedStepIds: string[];
  onToggleStepItem: (itemId: string) => void;
  onResetChecklist: () => void;
  onOpenScriptModal: () => void;
  onJumpTo3D: () => void;
}

export const WorkflowPipelineView: React.FC<WorkflowPipelineViewProps> = ({
  completedStepIds,
  onToggleStepItem,
  onResetChecklist,
  onOpenScriptModal,
  onJumpTo3D,
}) => {
  const [activePhaseId, setActivePhaseId] = useState<string>(WORKFLOW_STEPS[0].id);

  const totalChecklistItems = WORKFLOW_STEPS.reduce(
    (acc, step) => acc + step.checklistItems.length,
    0
  );
  const completedCount = completedStepIds.length;
  const progressPercent = Math.round((completedCount / totalChecklistItems) * 100);

  const activePhase: WorkflowStep =
    WORKFLOW_STEPS.find((s) => s.id === activePhaseId) || WORKFLOW_STEPS[0];

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-8 space-y-10">
      {/* Top Architectural Summary & Stage 18 Datum Diagram */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-[#14161B] border border-[#2A2E39] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF] font-mono">
              <span>BLENDER 4.x CYCLES PIPELINE</span>
              <span aria-hidden="true">·</span>
              <span>PARAMOUNT STAGE 18 (1954)</span>
              <span aria-hidden="true">·</span>
              <span>ACADEMY 1.66:1 GATE</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F0E6] mt-2 tracking-tight text-balance">
              Master Technical Workflow for Recreating Hitchcock&apos;s Rear Window Set
            </h1>

            <p className="text-sm text-[#9CA3AF] mt-3 leading-relaxed">
              Built by Paramount art directors {STAGE_18_SPECS.artDirectors}, the Rear Window
              courtyard was not a flat exterior backlot—it was a{' '}
              <strong className="text-[#F3F0E6] font-medium">
                185 ft × 98 ft × 40 ft indoor soundstage
              </strong>{' '}
              where the studio floor was torn out and excavated{' '}
              <strong className="text-[#F3F0E6] font-medium">25 feet down</strong> into the
              subterranean basement pit. This placed L.B. Jefferies&apos; second-floor wheelchair
              window directly at true Stage 18 floor level (<code className="text-amber-300">Z = 0.0m</code>).
            </p>
          </div>

          {/* Key Quantitative Specs Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-[#2A2E39]">
            <div>
              <div className="text-xs text-[#9CA3AF]">Soundstage Footprint</div>
              <div className="text-lg font-mono font-semibold text-[#F3F0E6] tabular-nums mt-0.5">
                185&apos; × 98&apos;
              </div>
              <div className="text-xs font-mono text-[#9CA3AF] tabular-nums">56.4m × 29.9m</div>
            </div>
            <div>
              <div className="text-xs text-[#9CA3AF]">Vertical Span</div>
              <div className="text-lg font-mono font-semibold text-amber-400 tabular-nums mt-0.5">
                65&apos; Total
              </div>
              <div className="text-xs font-mono text-[#9CA3AF] tabular-nums">+40&apos; Grid / -25&apos; Pit</div>
            </div>
            <div>
              <div className="text-xs text-[#9CA3AF]">Apartment Units</div>
              <div className="text-lg font-mono font-semibold text-[#F3F0E6] tabular-nums mt-0.5">
                31 Total
              </div>
              <div className="text-xs font-mono text-[#9CA3AF] tabular-nums">9 Hero · 22 Parallax</div>
            </div>
            <div>
              <div className="text-xs text-[#9CA3AF]">Pipeline Progress</div>
              <div className="text-lg font-mono font-semibold text-sky-400 tabular-nums mt-0.5">
                {progressPercent}% ({completedCount}/{totalChecklistItems})
              </div>
              <div className="text-xs font-mono text-[#9CA3AF] tabular-nums">Checklist Verified</div>
            </div>
          </div>
        </div>

        {/* Right Column: Two-Datum Elevation Cross-Section Blueprint */}
        <div className="lg:col-span-5 bg-[#14161B] border border-[#2A2E39] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-sky-400">
                STAGE 18 TWO-DATUM ELEVATION SCHEMATIC
              </span>
              <span className="text-xs font-mono text-[#9CA3AF] tabular-nums">Scale: 1m = 3.28ft</span>
            </div>
            <h2 className="text-base font-semibold text-[#F3F0E6] mt-1">
              Why the -25 ft (-7.62m) Excavated Datum Matters in Blender
            </h2>
          </div>

          <pre className="my-4 p-3.5 bg-[#0C0D10] border border-[#2A2E39] rounded-lg text-[11px] leading-snug font-mono text-[#D1D5DB] overflow-x-auto">
{`+12.19m (+40') ─── STAGE 18 LIGHTING CATWALK (140 Carbon Arcs) ───┐
               ┃    ┌─────────────────────────┐  [Water Tank]      │
 +6.60m (+21') ┃    │ 4F/5F Tenement (Parallax│   Composer Studio  │
               ┃    ├─────────────────────────┤                    │
  0.00m ( 0')  ╋════╡ 2F THORWALD SUITE (Hero)╞══◄═══ 112 ft ═══◄──╢ JEFF POV
 (Stage Floor) ┃    ├─────────────────────────┤  (Horizontal Ray)  │ (2F Bay)
               ┃    │ 1F Sculptress & Lonely. │                    │
 -7.62m (-25') ┻────┴─────────────────────────┴──[Zinnia Bed]──────┘
                    └── EXCAVATED SUBTERRANEAN BASEMENT PIT ──┘`}
          </pre>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={onJumpTo3D}
              className="px-3.5 py-2 text-xs font-medium text-[#F3F0E6] bg-[#1C2029] hover:bg-[#252A36] border border-[#2A2E39] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspect Datum in 3D Simulator</span>
            </button>
            <button
              onClick={onOpenScriptModal}
              className="px-3.5 py-2 text-xs font-medium text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Generate Blender .py Blockout</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6-Phase Interactive Pipeline Navigator & Detailed Technical Breakdown */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E39] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#F3F0E6]">
              6-Stage Blender Cycles Engineering Roadmap
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Select any production stage below to inspect exact Blender 4.x node setups, render
              parameters, and verification tasks.
            </p>
          </div>
          <button
            onClick={onResetChecklist}
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#F3F0E6] bg-[#14161B] border border-[#2A2E39] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        </div>

        {/* Phase Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {WORKFLOW_STEPS.map((step) => {
            const isSelected = step.id === activePhase.id;
            const stepCompletedCount = step.checklistItems.filter((item) =>
              completedStepIds.includes(item.id)
            ).length;
            const isAllDone = stepCompletedCount === step.checklistItems.length;

            return (
              <button
                key={step.id}
                onClick={() => setActivePhaseId(step.id)}
                className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1C2029] border-amber-500/70 text-[#F3F0E6]'
                    : 'bg-[#14161B] border-[#2A2E39] text-[#9CA3AF] hover:text-[#F3F0E6] hover:border-[#3B4150]'
                }`}
              >
                <div className="flex items-center justify-between w-full font-mono text-xs tabular-nums">
                  <span className={isSelected ? 'text-amber-400 font-semibold' : 'text-[#9CA3AF]'}>
                    Phase {step.stepNumber}
                  </span>
                  <span className={isAllDone ? 'text-emerald-400' : 'text-[#9CA3AF]'}>
                    {stepCompletedCount}/{step.checklistItems.length}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#F3F0E6] mt-2 line-clamp-2 leading-snug">
                  {step.title.replace(/^Reference Gathering & /, '')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Phase Deep-Dive Panel */}
        <div className="bg-[#14161B] border border-[#2A2E39] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#2A2E39]">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400">
                <span>PHASE {activePhase.stepNumber} SPECIFICATION</span>
                <span aria-hidden="true">·</span>
                <span>{activePhase.keyMetrics}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F3F0E6] mt-1">
                {activePhase.stepNumber}. {activePhase.title}
              </h3>
              <p className="text-sm text-[#9CA3AF] mt-1">{activePhase.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#9CA3AF]">
              <Layers className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Tools: {activePhase.blenderTools.join(' · ')}</span>
            </div>
          </div>

          <p className="text-sm text-[#D1D5DB] leading-relaxed max-w-4xl">
            {activePhase.summary}
          </p>

          {/* 3 Concrete Technical Sub-Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {activePhase.technicalInstructions.map((inst, idx) => (
              <div
                key={inst.heading}
                className="bg-[#0C0D10] border border-[#2A2E39] rounded-xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="text-xs font-mono text-sky-400">
                    STEP {activePhase.stepNumber}.{idx + 1}
                  </div>
                  <h4 className="text-sm font-semibold text-[#F3F0E6]">{inst.heading}</h4>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">{inst.detail}</p>
                </div>

                <div className="pt-3 border-t border-[#1E222B]">
                  <div className="text-[11px] font-mono text-[#9CA3AF] flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Blender Parameter:</span>
                  </div>
                  <code className="block mt-1 text-xs font-mono text-amber-300 break-words">
                    {inst.blenderSetting}
                  </code>
                </div>
              </div>
            ))}
          </div>

          {/* Critical Pitfall Warning Box (All-around 1px border, no thick left bar) */}
          <div className="bg-[#1A1415] border border-red-500/30 rounded-xl p-4 flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="text-red-300 font-semibold block mb-0.5">
                Common Production Pitfall to Avoid:
              </strong>
              <span className="text-[#D1D5DB]">{activePhase.pitfallToAvoid}</span>
            </div>
          </div>

          {/* Interactive Phase Verification Checklist */}
          <div className="pt-4 border-t border-[#2A2E39]">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] mb-3">
              Phase {activePhase.stepNumber} Verification Checklist (Click to mark complete)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activePhase.checklistItems.map((item) => {
                const isDone = completedStepIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => onToggleStepItem(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-[#F3F0E6]'
                        : 'bg-[#0C0D10] border-[#2A2E39] text-[#9CA3AF] hover:text-[#F3F0E6]'
                    }`}
                  >
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-[#9CA3AF] shrink-0 mt-0.5" />
                    )}
                    <span className="text-xs leading-snug">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
