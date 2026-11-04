import React, { useState } from 'react';
import {
  APARTMENTS,
  LIGHTING_PRESETS,
  LightingPreset,
  OPTICAL_PRESETS,
} from '../data/stage18Data';
import {
  Aperture,
  Camera,
  Eye,
  Flame,
  Lightbulb,
  Sliders,
  Sun,
} from 'lucide-react';

interface OpticsAndLightingViewProps {
  activeFocalLengthMm: number;
  onChangeFocalLengthMm: (mm: number) => void;
  activeLightingId: LightingPreset['id'];
  onChangeLightingId: (id: LightingPreset['id']) => void;
  onApplyTo3DStage: () => void;
}

export const OpticsAndLightingView: React.FC<OpticsAndLightingViewProps> = ({
  activeFocalLengthMm,
  onChangeFocalLengthMm,
  activeLightingId,
  onChangeLightingId,
  onApplyTo3DStage,
}) => {
  const [sensorGate, setSensorGate] = useState<'academy_22x16' | 'exakta_36x24'>('academy_22x16');
  const [fStop, setFStop] = useState<number>(4.0);
  const [targetDistanceFeet, setTargetDistanceFeet] = useState<number>(112); // Default: Thorwald (112 ft)

  const sensorW = sensorGate === 'academy_22x16' ? 22.0 : 36.0;
  const sensorH = sensorGate === 'academy_22x16' ? 16.0 : 24.0;
  const circleOfConfusionMm = sensorGate === 'academy_22x16' ? 0.018 : 0.029;

  // Optical calculations
  const hFovDeg = (2 * Math.atan(sensorW / (2 * activeFocalLengthMm)) * 180) / Math.PI;
  const vFovDeg = (2 * Math.atan(sensorH / (2 * activeFocalLengthMm)) * 180) / Math.PI;

  const distMeters = targetDistanceFeet * 0.3048;
  const frameWidthMeters = 2 * distMeters * Math.tan((hFovDeg * Math.PI) / 360);
  const frameHeightMeters = 2 * distMeters * Math.tan((vFovDeg * Math.PI) / 360);
  const frameWidthFeet = frameWidthMeters * 3.28084;
  const frameHeightFeet = frameHeightMeters * 3.28084;

  // Hyperfocal & Depth of Field math
  const focalM = activeFocalLengthMm / 1000;
  const cocM = circleOfConfusionMm / 1000;
  const hyperfocalM = (focalM * focalM) / (fStop * cocM) + focalM;
  const nearDofM = (hyperfocalM * distMeters) / (hyperfocalM + (distMeters - focalM));
  const farDofM =
    distMeters >= hyperfocalM
      ? Infinity
      : (hyperfocalM * distMeters) / (hyperfocalM - (distMeters - focalM));
  const totalDofFeet =
    farDofM === Infinity ? Infinity : (farDofM - nearDofM) * 3.28084;

  const activeLighting: LightingPreset =
    LIGHTING_PRESETS.find((l) => l.id === activeLightingId) || LIGHTING_PRESETS[1];

  // Calculate relative framing box scale for visual viewfinder diagram
  const boxScalePercent = Math.min(100, Math.max(10, (35 / activeFocalLengthMm) * 100));

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-8 space-y-12">
      {/* SECTION 1: fSpy Camera Calibration & Optical Lens Calculator */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#2A2E39]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <span>OPTICAL CALIBRATION &amp; FSPY SOLVER</span>
              <span aria-hidden="true">·</span>
              <span>MITCHELL BNC vs. EXAKTA VX 400MM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F0E6] mt-1 tracking-tight">
              fSpy Camera Matching &amp; Telephoto FOV / DoF Calculator
            </h1>
            <p className="text-sm text-[#9CA3AF] mt-1 max-w-3xl">
              Calculate exact Blender camera sensor sizes, horizontal/vertical FOV angles, and
              courtyard framing widths from L.B. Jefferies&apos; wheelchair nodal point.
            </p>
          </div>
          <button
            onClick={onApplyTo3DStage}
            className="self-start lg:self-auto px-4 py-2 text-xs font-medium text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview {activeFocalLengthMm}mm Lens in 3D Stage</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 7 Cols: Interactive Optical Controls & Preset Selector */}
          <div className="lg:col-span-7 bg-[#14161B] border border-[#2A2E39] rounded-xl p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              {/* 4 Historical Lens Presets */}
              <div>
                <label className="block text-xs font-mono text-[#9CA3AF] mb-2">
                  1954 Rear Window Historical Lens Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OPTICAL_PRESETS.map((preset) => {
                    const isSelected = activeFocalLengthMm === preset.focalLengthMm;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onChangeFocalLengthMm(preset.focalLengthMm);
                          setFStop(preset.fStop);
                          setSensorGate(
                            preset.sensorWidthMm === 36 ? 'exakta_36x24' : 'academy_22x16'
                          );
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C2029] border-amber-500/70 text-[#F3F0E6]'
                            : 'bg-[#0C0D10] border-[#2A2E39] text-[#9CA3AF] hover:text-[#F3F0E6]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-xs tabular-nums">
                          <span className="text-amber-400 font-semibold">
                            {preset.focalLengthMm === 200 ? '400mm Equiv' : `${preset.focalLengthMm}mm`}
                          </span>
                          <span>f/{preset.fStop}</span>
                        </div>
                        <div className="text-xs font-semibold text-[#F3F0E6] mt-1">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] mt-1 line-clamp-2">
                          {preset.narrativeUse}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Sliders: Focal Length, Sensor Gate, Focus Distance, Aperture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[#2A2E39]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9CA3AF] font-medium">Blender Focal Length</span>
                    <span className="font-mono text-amber-400 font-semibold tabular-nums">
                      {activeFocalLengthMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={400}
                    step={1}
                    value={activeFocalLengthMm}
                    onChange={(e) => onChangeFocalLengthMm(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#9CA3AF] tabular-nums">
                    <span>24mm Wide</span>
                    <span>50mm Normal</span>
                    <span>85mm Bino</span>
                    <span>400mm Exakta</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9CA3AF] font-medium">Target Courtyard Distance</span>
                    <span className="font-mono text-sky-400 font-semibold tabular-nums">
                      {targetDistanceFeet} ft ({distMeters.toFixed(1)}m)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={45}
                    max={140}
                    step={1}
                    value={targetDistanceFeet}
                    onChange={(e) => setTargetDistanceFeet(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#9CA3AF] tabular-nums">
                    <span>52&apos; Newlyweds</span>
                    <span>81&apos; Miss Torso</span>
                    <span>112&apos; Thorwald</span>
                    <span>123&apos; Roof</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-[#9CA3AF] font-medium">
                    Blender Camera Sensor Gate
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0C0D10] border border-[#2A2E39] rounded-lg">
                    <button
                      onClick={() => setSensorGate('academy_22x16')}
                      className={`px-2.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                        sensorGate === 'academy_22x16'
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
                      }`}
                    >
                      22×16mm (Academy)
                    </button>
                    <button
                      onClick={() => setSensorGate('exakta_36x24')}
                      className={`px-2.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                        sensorGate === 'exakta_36x24'
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
                      }`}
                    >
                      36×24mm (Exakta SLR)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-[#9CA3AF] font-medium">
                    Cycles Depth of Field Aperture (f-stop)
                  </label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-[#0C0D10] border border-[#2A2E39] rounded-lg font-mono text-xs tabular-nums">
                    {[2.8, 4.0, 5.6, 8.0].map((val) => (
                      <button
                        key={val}
                        onClick={() => setFStop(val)}
                        className={`py-1.5 rounded-md transition-colors cursor-pointer ${
                          fStop === val
                            ? 'bg-amber-500 text-slate-950 font-semibold'
                            : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
                        }`}
                      >
                        f/{val.toFixed(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Apartment Distance Presets */}
            <div className="pt-4 border-t border-[#2A2E39] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#9CA3AF] font-mono">Snap Focus Distance:</span>
              {APARTMENTS.filter((a) => a.isHero && a.distanceFromJeffFeet > 0).map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => setTargetDistanceFeet(apt.distanceFromJeffFeet)}
                  className={`px-2.5 py-1 font-mono text-[11px] rounded border transition-colors cursor-pointer ${
                    targetDistanceFeet === apt.distanceFromJeffFeet
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                      : 'bg-[#0C0D10] text-[#9CA3AF] border-[#2A2E39] hover:text-[#F3F0E6]'
                  }`}
                >
                  {apt.code.split(' ')[0]} ({apt.distanceFromJeffFeet}&apos;)
                </button>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Live Optical Telemetry & Viewfinder Crop Visualizer */}
          <div className="lg:col-span-5 bg-[#14161B] border border-[#2A2E39] rounded-xl p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#9CA3AF]">
                <span>EXAKTA / MITCHELL VIEWFINDER CROP</span>
                <span className="text-amber-400 tabular-nums">1.66:1 WIDESCREEN</span>
              </div>

              {/* Viewfinder Visual Frame */}
              <div className="relative w-full h-48 mt-3 bg-[#0C0D10] border border-[#2A2E39] rounded-lg overflow-hidden flex items-center justify-center">
                {/* Outer 35mm Master Stage Reference Grid */}
                <div className="absolute inset-3 border border-dashed border-[#2A2E39] flex items-start justify-between p-2 text-[10px] font-mono text-[#9CA3AF]">
                  <span>35mm Wide Courtyard Envelope (185&apos; × 98&apos;)</span>
                  <span>Z = 0.0m Datum</span>
                </div>

                {/* Crosshair Center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-px bg-[#1E222B]" />
                  <div className="h-full w-px bg-[#1E222B] absolute" />
                </div>

                {/* Dynamic Focal Length Crop Frame */}
                <div
                  style={{
                    width: `${boxScalePercent}%`,
                    height: `${boxScalePercent}%`,
                  }}
                  className="border-2 border-amber-400 bg-amber-500/10 rounded transition-all duration-150 flex flex-col items-center justify-center p-1 text-center"
                >
                  <span className="text-[11px] font-mono font-semibold text-amber-300 tabular-nums">
                    {activeFocalLengthMm}mm
                  </span>
                  <span className="text-[10px] font-mono text-[#F3F0E6] tabular-nums">
                    {frameWidthFeet.toFixed(1)}&apos; × {frameHeightFeet.toFixed(1)}&apos;
                  </span>
                </div>
              </div>
            </div>

            {/* Computed Blender Camera Values */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs tabular-nums">
              <div className="p-3 bg-[#0C0D10] border border-[#2A2E39] rounded-lg">
                <span className="text-[10px] text-[#9CA3AF] block">Horizontal / Vertical FOV</span>
                <span className="text-sm font-semibold text-[#F3F0E6] mt-0.5 block">
                  {hFovDeg.toFixed(1)}° H · {vFovDeg.toFixed(1)}° V
                </span>
              </div>
              <div className="p-3 bg-[#0C0D10] border border-[#2A2E39] rounded-lg">
                <span className="text-[10px] text-[#9CA3AF] block">Courtyard Frame Size</span>
                <span className="text-sm font-semibold text-amber-400 mt-0.5 block">
                  {frameWidthMeters.toFixed(2)}m × {frameHeightMeters.toFixed(2)}m
                </span>
              </div>
              <div className="p-3 bg-[#0C0D10] border border-[#2A2E39] rounded-lg">
                <span className="text-[10px] text-[#9CA3AF] block">Sharp Focus Zone (DoF)</span>
                <span className="text-sm font-semibold text-sky-400 mt-0.5 block">
                  {totalDofFeet === Infinity
                    ? 'Infinite (Hyperfocal)'
                    : `${totalDofFeet.toFixed(1)} ft (${(totalDofFeet * 0.3048).toFixed(2)}m)`}
                </span>
              </div>
              <div className="p-3 bg-[#0C0D10] border border-[#2A2E39] rounded-lg">
                <span className="text-[10px] text-[#9CA3AF] block">Blender Sensor Setup</span>
                <span className="text-sm font-semibold text-[#F3F0E6] mt-0.5 block">
                  {sensorW.toFixed(0)}mm × {sensorH.toFixed(0)}mm
                </span>
              </div>
            </div>

            <div className="text-xs text-[#9CA3AF] leading-relaxed bg-[#0C0D10] border border-[#2A2E39] rounded-lg p-3">
              <strong className="text-[#F3F0E6] font-medium">fSpy Calibration Rule:</strong>{' '}
              {activeFocalLengthMm >= 135
                ? 'At telephoto focal lengths (135mm–400mm), perspective lines flatten into near-parallel lines. Do NOT calibrate primary axes in fSpy on this lens—use your 35mm solve and dial the focal length to ' +
                  activeFocalLengthMm +
                  'mm in Blender.'
                : 'Wide/normal focal length selected. Safe for two-axis fSpy vanishing point calibration using the North brick lintels (+X) and vertical drainpipes (+Z).'}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 1954 Technicolor Lighting & Cycles Portal Rig Guide */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#2A2E39]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
              <span>ROBERT BURKS, ASC · STAGE 18 LIGHTING RIG</span>
              <span aria-hidden="true">·</span>
              <span>THREE-STRIP TECHNICOLOR</span>
            </div>
            <h2 className="text-2xl font-bold text-[#F3F0E6] mt-1">
              4-State Soundstage Lighting Switchboard &amp; Cycles Portal Guide
            </h2>
          </div>
          <button
            onClick={onApplyTo3DStage}
            className="self-start sm:self-auto px-4 py-2 text-xs font-medium text-[#F3F0E6] bg-[#1C2029] hover:bg-[#262B38] border border-[#2A2E39] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview {activeLighting.name.split(' (')[0]} in 3D</span>
          </button>
        </div>

        {/* 4 Time-of-Day Preset Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LIGHTING_PRESETS.map((preset) => {
            const isSelected = preset.id === activeLighting.id;
            return (
              <button
                key={preset.id}
                onClick={() => onChangeLightingId(preset.id)}
                className={`p-5 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1C2029] border-amber-500/70 text-[#F3F0E6]'
                    : 'bg-[#14161B] border-[#2A2E39] text-[#9CA3AF] hover:text-[#F3F0E6]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className={isSelected ? 'text-amber-400 font-semibold' : 'text-[#9CA3AF]'}>
                      {preset.kelvinKey}K Key
                    </span>
                    <span>Elev {preset.sunElevationDeg}°</span>
                  </div>
                  <h3 className="text-base font-bold text-[#F3F0E6] mt-1.5">{preset.name}</h3>
                  <p className="text-xs text-[#9CA3AF] mt-1">{preset.timeLabel}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2A2E39] flex items-center justify-between text-xs font-mono tabular-nums">
                  <span>Sun: {preset.sunIntensity}x</span>
                  <span className="text-amber-300">
                    Rooms: {preset.windowPracticalIntensity}x
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Lighting Preset Technical Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#14161B] border border-[#2A2E39] rounded-xl p-6 sm:p-8">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400">
              <span>ACTIVE SWITCHBOARD: {activeLighting.name.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span>{activeLighting.arcUnitsActive}</span>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-semibold text-[#F3F0E6] flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Cycles World &amp; Area Light Portal Setup
              </h4>
              <p className="text-sm text-[#D1D5DB] leading-relaxed">
                {activeLighting.cyclesWorldNotes}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#2A2E39]">
              <h4 className="text-base font-semibold text-[#F3F0E6] flex items-center gap-2">
                <Flame className="w-4 h-4 text-sky-400" />
                1954 Three-Strip Technicolor Grading &amp; AgX Look
              </h4>
              <p className="text-sm text-[#D1D5DB] leading-relaxed">
                {activeLighting.technicolorGradingNotes}
              </p>
            </div>
          </div>

          {/* Right 5 Cols: Exact Blender Node Parameters */}
          <div className="lg:col-span-5 bg-[#0C0D10] border border-[#2A2E39] rounded-xl p-5 space-y-4 font-mono text-xs tabular-nums">
            <div className="text-xs font-semibold text-[#F3F0E6] flex items-center gap-2 pb-2 border-b border-[#2A2E39]">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Exact Blender 4.x Cycles Parameters</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#1E222B]">
              <span className="text-[#9CA3AF]">Sun Elevation / Azimuth</span>
              <span className="text-[#F3F0E6]">
                {activeLighting.sunElevationDeg}° / {activeLighting.sunAzimuthDeg}°
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E222B]">
              <span className="text-[#9CA3AF]">Key Blackbody Temperature</span>
              <span className="text-amber-400">{activeLighting.kelvinKey} K</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E222B]">
              <span className="text-[#9CA3AF]">Skylight Fill Temperature</span>
              <span className="text-sky-400">{activeLighting.kelvinFill} K</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E222B]">
              <span className="text-[#9CA3AF]">Apartment Practical Multiplier</span>
              <span className="text-[#F3F0E6]">{activeLighting.windowPracticalIntensity} EV</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#9CA3AF]">Cycles Transmission Bounces</span>
              <span className="text-emerald-400">12 (Minimum for Dual Glass)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
