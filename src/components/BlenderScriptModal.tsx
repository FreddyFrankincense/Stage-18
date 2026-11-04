import React, { useMemo, useState } from 'react';
import {
  generateBlenderPythonScript,
  ScriptGeneratorConfig,
} from '../utils/blenderScriptGenerator';
import { LightingPreset } from '../data/stage18Data';
import { Check, Copy, Download, Terminal, X } from 'lucide-react';

interface BlenderScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLightingId: LightingPreset['id'];
}

export const BlenderScriptModal: React.FC<BlenderScriptModalProps> = ({
  isOpen,
  onClose,
  activeLightingId,
}) => {
  const [config, setConfig] = useState<ScriptGeneratorConfig>({
    unitSystem: 'IMPERIAL',
    includeStageCage: true,
    includeExcavatedPit: true,
    includeBuildingHulls: true,
    includeHeroApartmentEmpties: true,
    includeCyclesPortals: true,
    includeJeffCameraRig: true,
    configureCyclesSettings: true,
    lightingPreset: activeLightingId,
  });

  const [copied, setCopied] = useState<boolean>(false);

  const pythonCode = useMemo(() => {
    return generateBlenderPythonScript({
      ...config,
      lightingPreset: activeLightingId,
    });
  }, [config, activeLightingId]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rear_window_stage18_setup.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFlag = (key: keyof ScriptGeneratorConfig) => {
    setConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#14161B] border border-[#2A2E39] rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#2A2E39]">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-[#F3F0E6]">
                Blender 4.x Python (bpy) Stage 18 Scene Generator
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Open Blender &rarr; Scripting Workspace &rarr; New Text &rarr; Paste &amp; Run Script
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#9CA3AF] hover:text-[#F3F0E6] rounded-lg hover:bg-[#1C2029] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Left Options + Right Code Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left 4 Cols: Generator Configuration Toggles */}
          <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-[#2A2E39] space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-mono text-[#9CA3AF] mb-2">
                Scene Unit Scale
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0C0D10] border border-[#2A2E39] rounded-lg font-mono text-xs">
                <button
                  onClick={() => setConfig((c) => ({ ...c, unitSystem: 'IMPERIAL' }))}
                  className={`py-1.5 rounded transition-colors cursor-pointer ${
                    config.unitSystem === 'IMPERIAL'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
                  }`}
                >
                  Imperial (Feet)
                </button>
                <button
                  onClick={() => setConfig((c) => ({ ...c, unitSystem: 'METRIC' }))}
                  className={`py-1.5 rounded transition-colors cursor-pointer ${
                    config.unitSystem === 'METRIC'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
                  }`}
                >
                  Metric (Meters)
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono text-[#9CA3AF]">
                Generated Scene Elements
              </div>

              {[
                {
                  key: 'configureCyclesSettings' as const,
                  label: 'Cycles Render & AgX 1.66:1 Setup',
                  desc: '12 transmission bounces, 3984×2400 gate',
                },
                {
                  key: 'includeStageCage' as const,
                  label: 'Stage 18 Bounding Cage (185×98×40 ft)',
                  desc: 'Wireframe soundstage envelope',
                },
                {
                  key: 'includeExcavatedPit' as const,
                  label: 'Excavated Courtyard Pit (Z = -7.62m)',
                  desc: 'Subterranean garden floor datum (-25 ft)',
                },
                {
                  key: 'includeBuildingHulls' as const,
                  label: '7 Greenwich Village Building Hulls',
                  desc: 'Scaled proxy volumes with PBR base colors',
                },
                {
                  key: 'includeHeroApartmentEmpties' as const,
                  label: '9 Hero Apartment Empty Locators',
                  desc: 'Ready for File -> Link Collection Instances',
                },
                {
                  key: 'includeCyclesPortals' as const,
                  label: 'Cycles Area Light Portals',
                  desc: 'Inward-facing window portals for low noise',
                },
                {
                  key: 'includeJeffCameraRig' as const,
                  label: 'Jeff Nodal Wheelchair Camera Rig',
                  desc: '35mm, 50mm, 85mm & 400mm locked cameras',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 p-2.5 bg-[#0C0D10] border border-[#2A2E39] rounded-lg cursor-pointer hover:border-[#3B4150]"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(config[item.key])}
                    onChange={() => toggleFlag(item.key)}
                    className="mt-0.5 accent-amber-500"
                  />
                  <div className="text-xs">
                    <div className="font-medium text-[#F3F0E6]">{item.label}</div>
                    <div className="text-[11px] text-[#9CA3AF]">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Right 8 Cols: Live Python Code Preview */}
          <div className="lg:col-span-8 bg-[#0C0D10] p-6 overflow-y-auto">
            <pre className="text-xs font-mono text-[#D1D5DB] leading-relaxed whitespace-pre">
              {pythonCode}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#14161B] border-t border-[#2A2E39]">
          <span className="text-xs font-mono text-[#9CA3AF]">
            Compatible with Blender 4.0, 4.1, 4.2, and 4.3 LTS
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-medium text-[#F3F0E6] bg-[#1C2029] hover:bg-[#252A36] border border-[#2A2E39] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Python Script</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-medium text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download rear_window_stage18_setup.py</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
