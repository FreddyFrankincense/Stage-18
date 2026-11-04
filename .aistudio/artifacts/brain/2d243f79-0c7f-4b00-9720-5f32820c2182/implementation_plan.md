# Stage 18: Rear Window (1954) Blender 3D Pipeline & Interactive Set Workbench

An interactive 3D architectural blockout simulator and comprehensive Blender Cycles technical workbench designed to guide environment artists through recreating Hal Pereira and Joseph MacMillan Johnson's iconic 1954 Paramount Stage 18 courtyard set from Alfred Hitchcock's *Rear Window*.

### User Review & Critical Decisions

> [!IMPORTANT]
> All core scope and technical workflow choices have been aligned based on your selections. Review the architectural pipeline and interactive toolset below before we build the application.

- **Confirmed Application Scope**: Interactive 3D Stage 18 blockout viewer and Blender workflow workbench combining spatial sightline inspection with technical production calculators.
- **Confirmed Rendering Target**: Photorealistic offline rendering in **Blender Cycles** featuring full interior apartment rooms, glass transmission, and period-accurate 1954 Technicolor lighting.
- **Confirmed Interactive Modules**:
  1. **Interactive 3D Stage 18 Courtyard Massing & Sightline Simulator** (Three.js viewport with L.B. "Jeff" Jefferies' POV frustum, Orbit view, and excavated basement pit toggle).
  2. **Modular Building Breakdown & 31-Apartment Interior Checklist** (tracking hero fully-furnished interiors vs. parallax shell apartments).
  3. **fSpy Camera Calibration & Telephoto Lens Calculator** (comparing Hitchcock's 50mm normal POV, 75mm binocular view, and the 400mm Kilfitt Fern-Kilar on the Exakta VX SLR).
  4. **1954 Technicolor Lighting & Time-of-Day Studio Rig Guide** (Robert Burks' 4-state overhead arc/incandescent lighting system + Cycles Light Portals).
  5. **Customizable Blender Python (`bpy`) Blockout Generator** (downloadable `.py` script that automatically builds the Stage 18 reference grid, excavated courtyard, 7 building hulls, Jeff's camera rig, and collection hierarchy in Blender 4.x).

---

### 1. Overview & Core Concept

- **What It Does**: Recreating the *Rear Window* courtyard in Blender is uniquely challenging because the set was not a standard city block—it was a meticulously engineered **98 ft × 185 ft × 40 ft** indoor soundstage environment with a **25-foot excavated subterranean courtyard pit** so L.B. Jefferies' second-floor apartment sat at true studio floor level. This application provides both the **authoritative step-by-step Blender Cycles engineering methodology** and an **interactive 3D spatial workbench** to test camera lenses, inspect apartment sightlines, configure Cycles render settings, and export a ready-to-run Blender Python (`bpy`) scene generator.
- **Target Audience / Persona**: 3D environment artists, architectural visualizers, and virtual production technical directors working in Blender 4.x who want a historically accurate, memory-efficient workflow for multi-interior architectural scenes.
- **Key Value**: Eliminates guesswork on set dimensions, focal length compression, VRAM optimization across 31 apartment interiors, and Cycles portal lighting by uniting historical Paramount blueprint metrics with live 3D simulation and automated Blender script generation.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **3D Stage 18 Courtyard & Sightline Simulator**: Users explore a real-time 3D scale model of the Paramount Stage 18 set (`185' × 98' × 40'` with the `-25'` excavated garden courtyard). A collapsible bottom control dock lets users switch between **Free Orbit Architectural View** and **Jeff's Wheelchair Window POV**, scrub focal lengths (`35mm`, `50mm`, `75mm Binoculars`, `400mm Exakta Telephoto`), toggle the visibility of the visible soundstage ceiling grid and frustum sightline rays, and click individual apartments (Thorwald's, Miss Torso's, the Composer's, Miss Lonelyhearts', the Sculptress's) to inspect their elevation, depth, and required Blender detail tier.
  2. **Blender Production Pipeline & Technical Guide**: A structured 6-stage engineering walkthrough covering Reference & fSpy Calibration, Dimensional Blockout, Modular Kitbashing & UDIMs, Linked Apartment Interiors, Cycles Portal & Technicolor Lighting, and Multi-Pass Compositing.
  3. **Modular Building & 31-Apartment Asset Tracker**: Interactive matrix categorizing all 7 surrounding structures (125 West 9th St main red-brick tenement, West brick building, East stucco & fire-escape wing, North alleyway & Lombard Street backdrop) and all key apartments by **LOD Tier** (Tier 1: Full 3D Cycles Hero Interior, Tier 2: Mid-Depth Parallax Room, Tier 3: Curtain/Window Box Card) with interactive completion checkboxes and VRAM budget estimation.
  4. **fSpy & Optical Lens Calculator**: Interactive calculator translating 1954 35mm Academy Aperture (`1.66:1` / `22mm × 16mm` film gate) and 35mm full-frame (`36mm × 24mm` Exakta gate) into exact Blender sensor sizes, horizontal/vertical FOV degrees, and Depth of Field (`f/2.8`–`f/8`) values at exact courtyard distances.
  5. **Technicolor Lighting & Cycles Rig Configurator**: Interactive time-of-day switcher (*Morning Heatwave*, *Golden Hour Courtyard*, *Dusk Neon & Practical Lamps*, *Midnight Flashbulb Suspense*) displaying exact Kelvin temperatures, sun elevation/azimuth angles, Cycles Area Light Portal placements, and Three-Strip Technicolorlut/AgX curves.
  6. **Blender Python (`bpy`) Script Exporter**: Users toggle which elements to generate (Stage 18 bounding cage, excavated pit, 7 building blockout meshes, 31 apartment Empty locators, Jeff's camera with focal-length keyframes, and collection hierarchy) and copy or download a clean `rear_window_stage18_blockout.py` script for Blender 4.x.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: **1954 Paramount Architectural Drafting & Mid-Century Darkroom**. Combines the tactile precision of mid-century architectural blueprints and Exakta 35mm optical viewfinders with a modern dark-mode 3D technical studio interface.
  - *Color Palette & Mood*:
    - **60% Dominant Neutral Canvas**: Deep studio charcoal (`#0C0D10`) and warm darkroom slate (`#14161B`) so the 3D courtyard and lighting temperatures pop with high contrast.
    - **30% Structural Surfaces**: Blueprint graphite panels (`#1C1F26`), crisp `1px` architectural hairlines (`#2A2E39`), warm archival parchment text (`#F3F0E6`), and muted slate secondary prose (`#9CA3AF`).
    - **10% Accent Budget**: Exakta viewfinder amber (`#F59E0B`) for primary CTAs, active focal lengths, and camera frustum sightlines; Greenwich brick terracotta (`#DC2626`) for Thorwald / hero target callouts; and blueprint cyan (`#0EA5E9`) for dimensional measurements and Cycles portal indicators.
  - *Typography & Hierarchy*:
    - **Display / Headings**: `Bricolage Grotesque` (or `Outfit`) for crisp architectural headings and structural clarity.
    - **Body Prose**: `Plus Jakarta Sans` for highly legible technical documentation and workflow instructions.
    - **Data, Dimensions & Python Code**: `JetBrains Mono` with strict `tabular-nums` for foot/meter conversions, focal lengths, Kelvin values, and Python script previews.
  - *Component Styling & Layout*:
    - Full-viewport 1440px desktop architecture adhering to the strict 3-zone Top Bar Contract (`Stage 18 Studio` wordmark — 5 single-line workspace navigation links — `Export Blender .py` primary CTA).
    - In the 3D Simulator view, all camera, lens, lighting, and layer controls are consolidated into a **collapsible bottom control dock** so the 3D courtyard remains unobstructed.
    - Single-elevation cards with `1px` borders, zero decorative status dots, and unboxed typographic metadata separated by `·`.

- **Interactive Feedback & Motion**:
  - Smooth exponential camera damping (`THREE.MathUtils.damp`) when transitioning between Free Orbit, Stage Cross-Section, and Jeff's Window POV, or when zooming the virtual lens from `50mm` to `400mm`.
  - Real-time dynamic 3D sightline raycasting from Jeff's apartment window to the selected neighbor's window, showing exact distance in feet/meters and perspective angle.

---

### 3. Key Product Decisions & Trade-Offs (The Blender Technical Strategy)

> [!NOTE]
> The core technical methodology embedded into the workbench addresses the five hardest engineering problems of recreating *Rear Window* in Blender Cycles:

- **Decision 1: True Paramount Stage 18 Excavated Geometry vs. Flat Ground Plane**
  - *Chosen Approach*: Model the scene using the authentic **two-datum elevation system**: Datum `Z = 0.0m` at Stage 18 floor level (Jeff's 2nd-floor apartment window height) and Datum `Z = -7.62m (-25 ft)` for the excavated lower courtyard garden and Thorwald's ground-floor access.
  - *Why*: Hitchcock's camera angles rely on looking both *down* into the excavated courtyard garden and *across/up* at the 5-story brick tenement (`125 W. 9th St`). Modeling on a flat plane ruins the vertical perspective lines matched via fSpy.
  - *Alternatives Considered*: Flat street-level origin (`Z = 0` at courtyard floor), which makes matching Jeff's horizontal sightline to the opposite 2nd-floor apartments more error-prone during camera calibration.

- **Decision 2: Two-Pass fSpy Camera Calibration (Wide Master vs. Telephoto Plates)**
  - *Chosen Approach*: Calibrate the master courtyard blockout using wide 35mm/50mm panning shots where both horizontal window cornices (X-axis) and vertical brick pilasters/drainpipes (Z-axis) are visible, then lock the camera nodal point inside Jeff's bay window and drive telephoto shots purely via focal length (`75mm` to `400mm`) and pan/tilt rotation.
  - *Why*: Telephoto shots (`400mm`) have extreme perspective compression with nearly parallel vanishing lines, which causes fSpy's vanishing-point solver to become unstable if used for primary geometry reconstruction.

- **Decision 3: Linked Library Overrides & Collection Instances for 31 Apartments**
  - *Chosen Approach*: Build the exterior brick/stucco facades using modular snap-grid architectural kits (`3.0m × 3.2m` bay modules), while authoring each of the **8–12 hero furnished apartments** (Thorwald, Miss Torso, Composer, Miss Lonelyhearts, Sculptress, Newlyweds, Dog Owners, Jeff's Room) in separate `.blend` asset collections linked into the master scene via **Collection Instances**, and using **Interior Mapping / Parallax Shader Cards** or lightweight curtain planes for the remaining ~19 background windows.
  - *Why*: Attempting to keep 31 fully furnished, high-poly 1950s apartments in a single monolithic `.blend` file overwhelms viewport responsiveness and Cycles BVH build time. Linked collections allow per-apartment lighting and prop detailing with near-zero viewport overhead when masked.

- **Decision 4: Cycles Light Portals & Light Linking for Multi-Room Interiors**
  - *Chosen Approach*: Place **Cycles Area Light Portals** directly inside the window frames of the 8 hero apartments to guide path-traced exterior courtyard bounce light indoors, combined with **Blender 4.x Light Linking** so practical 1950s table lamps and warm interior fill lights illuminate their specific room actors/furniture without spilling unnaturally onto neighboring building facades.
  - *Why*: In Cycles, looking from across a courtyard into small distant windows creates severe fireflies and noise inside the rooms unless Light Portals and interior fill lights are used.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     TOP BAR (3-Zone Navigation Contract)                     │
│  [Stage 18 Workbench]   [3D Simulator · Pipeline · Apartments · Optics · Light] │
│                                                    [Export Blender Script]   │
└───────────────────────────────────────┬──────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
┌───────────────────────┐   ┌───────────────────────┐   ┌──────────────────────┐
│ 3D COURTYARD VIEWPORT │   │ BLENDER PIPELINE &    │   │ BPY SCRIPT GENERATOR │
│ (Three.js + WebGL2)   │   │ CALCULATOR MODULES    │   │ & EXPORT MODAL       │
├───────────────────────┤   ├───────────────────────┤   ├──────────────────────┤
│ • Stage 18 Massing    │   │ • 6-Phase Workflow    │   │ • Unit Scale (m/ft)  │
│   (185' × 98' × 40')  │   │   Blueprint & Checklist│  │ • Collection Setup   │
│ • Excavated Pit (-25')│   │ • 31-Apartment Asset  │   │ • Procedural Hulls   │
│ • 7 Building Hulls &  │   │   & LOD Matrix        │   │ • 31 Apartment Empties│
│   Window Bays         │   │ • fSpy & Focal Length │   │ • Jeff POV Camera +  │
│ • Sightline Raycaster │   │   FOV/DoF Calculator  │   │   Lens Keyframes     │
│   (Jeff -> Neighbor)  │   │ • 1954 Technicolor    │   │ • Cycles Render &    │
│ • Collapsible Bottom  │   │   Lighting & Portal   │   │   Portal Presets     │
│   HUD Dock            │   │   Inspector           │   │ • One-Click .py Save │
└───────────────────────┘   └───────────────────────┘   └──────────────────────┘
```

- **Data Model & State**:
  - **Courtyard Spatial Dataset**: Exact coordinates (in both feet and Blender meters), dimensions, floor count, facade material type (Red Greenwich Brick, Painted Cream Brick, Weathered Stucco, Limestone Trim), and window grid layout for the 7 distinct building volumes around the courtyard.
  - **Hero Apartments Registry**: Detailed metadata for each key apartment (Occupant name, Building ID, Floor/Bay coordinates, Distance from Jeff's lens in feet/meters, Horizontal/Vertical sightline angle, Recommended Blender LOD Tier, Key Props list, and Interior Lighting setup).
  - **Optical & Lighting Presets State**: Camera mode (`orbit` vs. `jeff_pov` vs. `section_cut`), focal length (`35mm` to `400mm`), time-of-day preset (`morning`, `afternoon`, `dusk`, `night_flash`), and active workflow checklist progress persisted in `localStorage`.

- **Interactive Component & State Mapping**:
  - **3D Viewport & Collapsible Bottom Dock**: Clicking any apartment window in the 3D scene (via raycasting) or selecting it from the dock highlights the apartment volume, draws a calibrated sightline vector from Jeff's bay window, updates the live distance/angle telemetry, and smoothly focuses the camera if in **Jeff's POV** mode.
  - **fSpy & Lens Simulator**: Adjusting the focal length slider (`35mm`–`400mm`) or sensor preset (`1954 Academy 35mm` vs. `Exakta Full-Frame 35mm`) dynamically recalculates the horizontal/vertical FOV, hyperfocal distance, and Depth of Field blade aperture (`f/2.8`–`f/11`), and syncs directly with the 3D POV camera frustum.
  - **31-Apartment Checklist & VRAM Budgeter**: Filtering apartments by LOD Tier (`Tier 1 Full Interior`, `Tier 2 Parallax`, `Tier 3 Window Card`) or toggling completion status updates the project progress bar and calculates estimated Cycles polygon/VRAM impact.
  - **Blender Python (`bpy`) Generator**: Toggling script configuration flags dynamically regenerates a valid, syntax-highlighted Blender 4.x Python script that users can copy to clipboard or download as `rear_window_stage18_setup.py`.
