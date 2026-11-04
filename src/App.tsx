/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { APARTMENTS, LightingPreset } from './data/stage18Data';
import { Courtyard3DViewport } from './components/Courtyard3DViewport';
import { WorkflowPipelineView } from './components/WorkflowPipelineView';
import { ApartmentMatrixView } from './components/ApartmentMatrixView';
import { OpticsAndLightingView } from './components/OpticsAndLightingView';
import { BlenderScriptModal } from './components/BlenderScriptModal';

export type ActiveTab = 'courtyard_3d' | 'pipeline' | 'apartments' | 'optics_lighting';

const STORAGE_KEY_STEPS = 'stage18_rw_completed_steps_v1';
const STORAGE_KEY_APTS = 'stage18_rw_completed_apts_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('courtyard_3d');
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>(APARTMENTS[0].id);
  const [activeFocalLengthMm, setActiveFocalLengthMm] = useState<number>(50);
  const [activeLightingId, setActiveLightingId] = useState<LightingPreset['id']>('afternoon');
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);

  const [completedStepIds, setCompletedStepIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STEPS);
      return saved ? JSON.parse(saved) : ['chk_1_1', 'chk_2_1'];
    } catch {
      return ['chk_1_1', 'chk_2_1'];
    }
  });

  const [completedAptIds, setCompletedAptIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APTS);
      return saved ? JSON.parse(saved) : ['apt_jeff_home'];
    } catch {
      return ['apt_jeff_home'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STEPS, JSON.stringify(completedStepIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [completedStepIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APTS, JSON.stringify(completedAptIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [completedAptIds]);

  const handleToggleStepItem = (itemId: string) => {
    setCompletedStepIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleResetChecklist = () => {
    setCompletedStepIds([]);
  };

  const handleToggleAptComplete = (aptId: string) => {
    setCompletedAptIds((prev) =>
      prev.includes(aptId) ? prev.filter((id) => id !== aptId) : [...prev, aptId]
    );
  };

  const handleInspectAptIn3D = (aptId: string) => {
    setSelectedApartmentId(aptId);
    setActiveTab('courtyard_3d');
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F3F0E6] flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0C0D10] border-b border-[#2A2E39] sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#courtyard"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('courtyard_3d');
          }}
          className="text-lg font-bold tracking-tight text-[#F3F0E6] font-display whitespace-nowrap shrink-0"
        >
          Stage 18 Workbench
        </a>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-[#9CA3AF] overflow-x-auto">
          <a
            href="#courtyard"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('courtyard_3d');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-0.5 ${
              activeTab === 'courtyard_3d'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 decoration-amber-400'
                : 'hover:text-[#F3F0E6] hover:underline hover:underline-offset-8'
            }`}
          >
            3D Courtyard
          </a>
          <a
            href="#pipeline"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('pipeline');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-0.5 ${
              activeTab === 'pipeline'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 decoration-amber-400'
                : 'hover:text-[#F3F0E6] hover:underline hover:underline-offset-8'
            }`}
          >
            Blender Pipeline
          </a>
          <a
            href="#apartments"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('apartments');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-0.5 ${
              activeTab === 'apartments'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 decoration-amber-400'
                : 'hover:text-[#F3F0E6] hover:underline hover:underline-offset-8'
            }`}
          >
            31 Apartments
          </a>
          <a
            href="#optics"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('optics_lighting');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-0.5 ${
              activeTab === 'optics_lighting'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 decoration-amber-400'
                : 'hover:text-[#F3F0E6] hover:underline hover:underline-offset-8'
            }`}
          >
            Optics &amp; Light
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setIsScriptModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Export Blender .py
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1">
        {activeTab === 'courtyard_3d' && (
          <Courtyard3DViewport
            selectedApartmentId={selectedApartmentId}
            onSelectApartment={setSelectedApartmentId}
            activeFocalLengthMm={activeFocalLengthMm}
            onChangeFocalLengthMm={setActiveFocalLengthMm}
            activeLightingId={activeLightingId}
            onChangeLightingId={setActiveLightingId}
            onJumpToPipelineTab={() => setActiveTab('pipeline')}
          />
        )}

        {activeTab === 'pipeline' && (
          <WorkflowPipelineView
            completedStepIds={completedStepIds}
            onToggleStepItem={handleToggleStepItem}
            onResetChecklist={handleResetChecklist}
            onOpenScriptModal={() => setIsScriptModalOpen(true)}
            onJumpTo3D={() => setActiveTab('courtyard_3d')}
          />
        )}

        {activeTab === 'apartments' && (
          <ApartmentMatrixView
            selectedApartmentId={selectedApartmentId}
            completedAptIds={completedAptIds}
            onToggleAptComplete={handleToggleAptComplete}
            onInspectIn3D={handleInspectAptIn3D}
          />
        )}

        {activeTab === 'optics_lighting' && (
          <OpticsAndLightingView
            activeFocalLengthMm={activeFocalLengthMm}
            onChangeFocalLengthMm={setActiveFocalLengthMm}
            activeLightingId={activeLightingId}
            onChangeLightingId={setActiveLightingId}
            onApplyTo3DStage={() => setActiveTab('courtyard_3d')}
          />
        )}
      </main>

      {/* Blender Python Script Exporter Modal */}
      <BlenderScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        activeLightingId={activeLightingId}
      />
    </div>
  );
}
