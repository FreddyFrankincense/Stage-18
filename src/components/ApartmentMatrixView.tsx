import React, { useMemo, useState } from 'react';
import {
  APARTMENTS,
  ApartmentSpec,
  BUILDINGS,
  LodTier,
} from '../data/stage18Data';
import {
  Building2,
  CheckSquare,
  Crosshair,
  Search,
  Square,
} from 'lucide-react';

interface ApartmentMatrixViewProps {
  selectedApartmentId: string;
  completedAptIds: string[];
  onToggleAptComplete: (aptId: string) => void;
  onInspectIn3D: (aptId: string) => void;
}

export const ApartmentMatrixView: React.FC<ApartmentMatrixViewProps> = ({
  selectedApartmentId,
  completedAptIds,
  onToggleAptComplete,
  onInspectIn3D,
}) => {
  const [tierFilter, setTierFilter] = useState<'all' | LodTier>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredApartments = useMemo(() => {
    return APARTMENTS.filter((apt) => {
      if (tierFilter !== 'all' && apt.lodTier !== tierFilter) return false;
      if (buildingFilter !== 'all' && apt.buildingId !== buildingFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          apt.name.toLowerCase().includes(q) ||
          apt.occupant.toLowerCase().includes(q) ||
          apt.code.toLowerCase().includes(q) ||
          apt.buildingName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tierFilter, buildingFilter, searchQuery]);

  const totals = useMemo(() => {
    return filteredApartments.reduce(
      (acc, apt) => ({
        tris: acc.tris + apt.estimatedTris,
        vram: acc.vram + apt.estimatedVramMb,
        portals: acc.portals + apt.cyclesPortals,
      }),
      { tris: 0, vram: 0, portals: 0 }
    );
  }, [filteredApartments]);

  const formatLodLabel = (tier: LodTier) => {
    if (tier === 'tier1_hero') return 'Tier 1 · Full 3D Linked Room';
    if (tier === 'tier2_parallax') return 'Tier 2 · OSL / Box Parallax';
    return 'Tier 3 · Window Curtain Card';
  };

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-8 space-y-10">
      {/* Header & Memory Budget Summary */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#2A2E39]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span>MODULAR KITBASH &amp; LINKED LIBRARY ARCHITECTURE</span>
            <span aria-hidden="true">·</span>
            <span>31 APARTMENT UNITS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F0E6] mt-1 tracking-tight">
            7-Building Massing &amp; 31-Apartment Interior LOD Matrix
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-2 max-w-3xl leading-relaxed">
            To render the entire courtyard in Cycles without exhausting GPU VRAM, author only the{' '}
            <strong className="text-[#F3F0E6] font-medium">9 narrative hero apartments</strong> as
            full 3D linked collections (<code className="text-amber-300">File &rarr; Link</code>),
            and populate the remaining 22 peripheral windows with parallax interior mapping shaders
            and curtain planes.
          </p>
        </div>

        {/* Live Filtered VRAM & Polygon Budget Strip */}
        <div className="grid grid-cols-3 gap-4 bg-[#14161B] border border-[#2A2E39] rounded-xl px-5 py-3.5 shrink-0">
          <div>
            <div className="text-xs text-[#9CA3AF]">Est. Geometry</div>
            <div className="text-base font-mono font-semibold text-[#F3F0E6] tabular-nums mt-0.5">
              {(totals.tris / 1000).toFixed(0)}k Tris
            </div>
          </div>
          <div className="border-l border-[#2A2E39] pl-4">
            <div className="text-xs text-[#9CA3AF]">Cycles VRAM</div>
            <div className="text-base font-mono font-semibold text-amber-400 tabular-nums mt-0.5">
              {(totals.vram / 1024).toFixed(2)} GB
            </div>
          </div>
          <div className="border-l border-[#2A2E39] pl-4">
            <div className="text-xs text-[#9CA3AF]">Light Portals</div>
            <div className="text-base font-mono font-semibold text-sky-400 tabular-nums mt-0.5">
              {totals.portals} Active
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#14161B] border border-[#2A2E39] rounded-xl p-4">
        {/* Segmented LOD Tier Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0C0D10] border border-[#2A2E39] rounded-lg">
          <button
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tierFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
            }`}
          >
            All Tiers ({APARTMENTS.length})
          </button>
          <button
            onClick={() => setTierFilter('tier1_hero')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tierFilter === 'tier1_hero'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
            }`}
          >
            Tier 1: Full 3D Hero
          </button>
          <button
            onClick={() => setTierFilter('tier2_parallax')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tierFilter === 'tier2_parallax'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
            }`}
          >
            Tier 2: Parallax Room
          </button>
          <button
            onClick={() => setTierFilter('tier3_curtain')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tierFilter === 'tier3_curtain'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
            }`}
          >
            Tier 3: Curtain Card
          </button>
        </div>

        {/* Building Selector & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            aria-label="Filter by Building"
            className="px-3 py-1.5 text-xs bg-[#0C0D10] text-[#F3F0E6] border border-[#2A2E39] rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All 7 Stage 18 Structures</option>
            {BUILDINGS.filter((b) => b.id !== 'bldg_courtyard_pit').map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search occupant, prop, code..."
              className="pl-8 pr-3 py-1.5 text-xs bg-[#0C0D10] text-[#F3F0E6] border border-[#2A2E39] rounded-lg focus:outline-none focus:border-amber-400 w-full sm:w-60"
            />
          </div>
        </div>
      </section>

      {/* Apartment Specifications Table & Detail Cards */}
      <section className="space-y-4">
        {filteredApartments.length === 0 ? (
          <div className="bg-[#14161B] border border-[#2A2E39] rounded-xl p-12 text-center space-y-3">
            <p className="text-sm text-[#9CA3AF]">
              No apartments match your current filter criteria.
            </p>
            <button
              onClick={() => {
                setTierFilter('all');
                setBuildingFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-medium text-slate-950 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredApartments.map((apt: ApartmentSpec) => {
              const isDone = completedAptIds.includes(apt.id);
              const isSelected = apt.id === selectedApartmentId;

              return (
                <div
                  key={apt.id}
                  className={`bg-[#14161B] border rounded-xl p-6 flex flex-col justify-between transition-colors ${
                    isSelected
                      ? 'border-amber-500/70'
                      : 'border-[#2A2E39] hover:border-[#3A404D]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Unboxed Metadata Row with typographic separators */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#9CA3AF] tabular-nums">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-amber-400 font-semibold">{apt.code}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatLodLabel(apt.lodTier)}</span>
                        <span aria-hidden="true">·</span>
                        <span>Floor {apt.floor}</span>
                      </div>
                      <button
                        onClick={() => onToggleAptComplete(apt.id)}
                        className="flex items-center gap-1.5 text-xs font-sans text-[#9CA3AF] hover:text-[#F3F0E6] cursor-pointer"
                      >
                        {isDone ? (
                          <>
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Modeled</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4" />
                            <span>Mark Modeled</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#F3F0E6]">{apt.name}</h3>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        Occupant: <span className="text-[#D1D5DB]">{apt.occupant}</span> · Structure:{' '}
                        <span className="text-[#D1D5DB]">{apt.buildingName}</span>
                      </p>
                    </div>

                    {/* Spatial & Cycles Telemetry Strip */}
                    <div className="grid grid-cols-4 gap-2 py-2.5 px-3 bg-[#0C0D10] border border-[#2A2E39] rounded-lg text-xs font-mono tabular-nums">
                      <div>
                        <span className="text-[#9CA3AF] block text-[10px]">Sightline Dist</span>
                        <span className="text-[#F3F0E6]">{apt.distanceFromJeffFeet} ft</span>
                      </div>
                      <div>
                        <span className="text-[#9CA3AF] block text-[10px]">Datum Elev</span>
                        <span className="text-[#F3F0E6]">
                          {apt.elevationFeet >= 0 ? `+${apt.elevationFeet}` : apt.elevationFeet} ft
                        </span>
                      </div>
                      <div>
                        <span className="text-[#9CA3AF] block text-[10px]">Cycles Portals</span>
                        <span className="text-sky-400">{apt.cyclesPortals} Area</span>
                      </div>
                      <div>
                        <span className="text-[#9CA3AF] block text-[10px]">Budget</span>
                        <span className="text-amber-300">{apt.estimatedVramMb} MB</span>
                      </div>
                    </div>

                    {/* Key Props & Interior Details */}
                    <div className="space-y-1.5 text-xs">
                      <div className="font-medium text-[#F3F0E6]">
                        Required Hero Props &amp; Architectural Elements:
                      </div>
                      <div className="text-[#9CA3AF] leading-relaxed">
                        {apt.keyProps.join(' · ')}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="font-medium text-[#F3F0E6]">
                        Blender Cycles &amp; Lighting Setup:
                      </div>
                      <p className="text-[#9CA3AF] leading-relaxed">{apt.lightingNotes}</p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-[#2A2E39]">
                    <span className="text-xs font-mono text-[#9CA3AF] tabular-nums">
                      Window Opening: {apt.windowSizeMeters[0]}m × {apt.windowSizeMeters[1]}m
                    </span>
                    <button
                      onClick={() => onInspectIn3D(apt.id)}
                      className="px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Aim POV in 3D Stage</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 7 Surrounding Building Massing Reference Table */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-[#F3F0E6]">
            Paramount Stage 18 Building Hull Specifications (7 Volumes)
          </h2>
        </div>

        <div className="bg-[#14161B] border border-[#2A2E39] rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2A2E39] text-[#9CA3AF] font-mono">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Structure Name</th>
                <th className="py-3.5 px-4">Dimensions (Imperial)</th>
                <th className="py-3.5 px-4 text-right">Blender Size (m)</th>
                <th className="py-3.5 px-4">Primary Material &amp; Kitbash Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E39]">
              {BUILDINGS.map((b) => (
                <tr key={b.id} className="hover:bg-[#1C2029]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-amber-400 whitespace-nowrap">
                    {b.code}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#F3F0E6]">{b.name}</td>
                  <td className="py-3.5 px-4 font-mono text-[#D1D5DB] tabular-nums whitespace-nowrap">
                    {b.dimensionsFeet}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-sky-400 text-right tabular-nums whitespace-nowrap">
                    {b.sizeMeters[0]}m × {b.sizeMeters[2]}m × {b.sizeMeters[1]}m
                  </td>
                  <td className="py-3.5 px-4 text-[#9CA3AF] max-w-md">{b.blenderNotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
