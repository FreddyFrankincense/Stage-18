export type LodTier = 'tier1_hero' | 'tier2_parallax' | 'tier3_curtain';

export interface BuildingSpec {
  id: string;
  name: string;
  code: string;
  role: string;
  positionMeters: [number, number, number]; // X, Y (up in Three.js, Z in Blender), Z
  sizeMeters: [number, number, number]; // Width, Height, Depth
  dimensionsFeet: string;
  floors: number;
  baseElevationFeet: number; // -25 ft (courtyard pit) or 0 ft (stage floor)
  facadeMaterial: string;
  colorHex: number;
  trimColorHex: number;
  blenderNotes: string;
}

export interface ApartmentSpec {
  id: string;
  code: string;
  name: string;
  occupant: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  elevationFeet: number; // Relative to Stage Floor (0 ft = Jeff's 2nd floor level)
  positionMeters: [number, number, number]; // World coords of window center in Three.js
  windowSizeMeters: [number, number];
  distanceFromJeffFeet: number;
  horizontalAngleDeg: number;
  verticalAngleDeg: number;
  lodTier: LodTier;
  estimatedTris: number;
  estimatedVramMb: number;
  cyclesPortals: number;
  keyProps: string[];
  lightingNotes: string;
  blenderApproach: string;
  isHero: boolean;
}

export interface OpticalPreset {
  id: string;
  name: string;
  focalLengthMm: number;
  cameraSystem: string;
  sensorWidthMm: number;
  sensorHeightMm: number;
  aspectRatio: string;
  fStop: number;
  narrativeUse: string;
  fSpyNotes: string;
}

export interface LightingPreset {
  id: 'morning' | 'afternoon' | 'dusk' | 'night_flash';
  name: string;
  timeLabel: string;
  kelvinKey: number;
  kelvinFill: number;
  sunElevationDeg: number;
  sunAzimuthDeg: number;
  sunIntensity: number;
  ambientSkyHex: number;
  ambientGroundHex: number;
  ambientIntensity: number;
  fogHex: number;
  windowPracticalIntensity: number;
  arcUnitsActive: string;
  cyclesWorldNotes: string;
  technicolorGradingNotes: string;
}

export interface WorkflowStep {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  summary: string;
  keyMetrics: string;
  blenderTools: string[];
  technicalInstructions: {
    heading: string;
    detail: string;
    blenderSetting: string;
  }[];
  pitfallToAvoid: string;
  checklistItems: {
    id: string;
    label: string;
    category: string;
  }[];
}

// Jeff's 2nd-floor wheelchair bay window origin in Three.js space (meters)
// Datum Y = 0.0m is Stage 18 main floor (Jeff's 2nd floor window level!)
// Excavated courtyard garden floor is at Y = -7.62m (-25 ft)
export const JEFF_CAMERA_ORIGIN_METERS: [number, number, number] = [0, 0.4, 21.5];

export const STAGE_18_SPECS = {
  lengthFeet: 185,
  widthFeet: 98,
  heightFeet: 40,
  excavationDepthFeet: 25,
  totalVerticalSpanFeet: 65,
  lengthMeters: 56.39,
  widthMeters: 29.87,
  heightMeters: 12.19,
  excavationDepthMeters: 7.62,
  totalApartments: 31,
  heroFurnishedApartments: 9,
  artDirectors: 'Hal Pereira & Joseph MacMillan Johnson',
  cinematographer: 'Robert Burks, ASC',
  realWorldInspiration: '125 Christopher Street / West 9th Street, Greenwich Village, NYC',
};

export const BUILDINGS: BuildingSpec[] = [
  {
    id: 'bldg_main_north',
    code: 'BLDG-01',
    name: '125 West 9th St. Main Red-Brick Tenement',
    role: 'Primary opposite facade housing Lars Thorwald, the Couple with the Dog, and rooftop sunbathers',
    positionMeters: [0, -7.62, -16.5],
    sizeMeters: [18.5, 17.8, 7.5],
    dimensionsFeet: '60.7 ft W × 58.4 ft H × 24.6 ft D',
    floors: 5,
    baseElevationFeet: -25,
    facadeMaterial: 'Weathered Red Greenwich Brick + Limestone Cornices & Iron Fire Escapes',
    colorHex: 0x8c3b2b,
    trimColorHex: 0xc2b59b,
    blenderNotes: 'Build with 3.0m × 3.2m modular window bays. Use a 2-UDIM brick shader with vertex-color soot masks beneath windowsills and fire-escape anchor plates.',
  },
  {
    id: 'bldg_east_stucco',
    code: 'BLDG-02',
    name: 'East Stucco & Veranda Wing (Miss Torso & Newlyweds)',
    role: 'Right-flank apartment building featuring wide multi-pane casement windows and balcony railings',
    positionMeters: [13.2, -7.62, -3.5],
    sizeMeters: [7.8, 15.6, 22.0],
    dimensionsFeet: '25.6 ft W × 51.2 ft H × 72.2 ft D',
    floors: 4,
    baseElevationFeet: -25,
    facadeMaterial: 'Warm Ochre-Cream Painted Stucco + Dark Green Shutters',
    colorHex: 0xb89f7d,
    trimColorHex: 0x3b4d3e,
    blenderNotes: 'Miss Torso’s 2nd-floor apartment requires a wide 3-bay window opening and deep 5.5m room interior for her ballet rehearsal blocking.',
  },
  {
    id: 'bldg_west_brick',
    code: 'BLDG-03',
    name: 'West Cream-Brick Tenement (Miss Lonelyhearts & Sculptress)',
    role: 'Left-flank building stepping down into the excavated lower garden courtyard',
    positionMeters: [-13.2, -7.62, -2.5],
    sizeMeters: [7.8, 15.2, 23.5],
    dimensionsFeet: '25.6 ft W × 49.8 ft H × 77.1 ft D',
    floors: 4,
    baseElevationFeet: -25,
    facadeMaterial: 'Aged Buff/Yellow-Cream Brick + Cast-Iron Basement Stairwell',
    colorHex: 0x9e8c70,
    trimColorHex: 0x5c5346,
    blenderNotes: 'The ground-level garden patio at Z = -7.62m (-25 ft) connects directly to the Sculptress’s apartment and Miss Lonelyhearts’ ground-floor window.',
  },
  {
    id: 'bldg_composer_studio',
    code: 'BLDG-04',
    name: 'North-East Atelier & Composer’s Penthouse Building',
    role: 'Recessed upper-right structure featuring the large double-height glass studio window',
    positionMeters: [11.8, -7.62, -16.8],
    sizeMeters: [7.2, 16.8, 7.0],
    dimensionsFeet: '23.6 ft W × 55.1 ft H × 23.0 ft D',
    floors: 4,
    baseElevationFeet: -25,
    facadeMaterial: 'Dark Brownstone & Industrial Steel Studio Glazing',
    colorHex: 0x6e5246,
    trimColorHex: 0x8f969c,
    blenderNotes: 'The top floor features a massive north-light style steel-framed studio window showcasing the grand piano and party guests.',
  },
  {
    id: 'bldg_alley_backdrop',
    code: 'BLDG-05',
    name: 'North Alleyway & West 10th Street Cut-Through',
    role: 'Deep forced-perspective slot between Main Tenement and West Wing leading to street traffic & bar',
    positionMeters: [-11.5, -7.62, -21.5],
    sizeMeters: [6.8, 16.0, 6.0],
    dimensionsFeet: '22.3 ft W × 52.5 ft H × 19.7 ft D',
    floors: 4,
    baseElevationFeet: -25,
    facadeMaterial: 'Forced-Perspective Dark Brick + Neon Tavern Sign & Street Asphalt',
    colorHex: 0x4f3d36,
    trimColorHex: 0x7c6f64,
    blenderNotes: ' Built at 0.85× forced scale in Stage 18 to exaggerate street depth. Place an emissive neon sign and animated vehicle gobos on the far street plane.',
  },
  {
    id: 'bldg_jeff_south',
    code: 'BLDG-06',
    name: 'South Building: L.B. "Jeff" Jefferies’ Apartment (Camera Origin)',
    role: 'Foreground camera enclosure at Stage 18 main floor level (Elevation 0.0m / +25 ft above pit)',
    positionMeters: [0, -7.62, 24.5],
    sizeMeters: [16.0, 15.0, 6.5],
    dimensionsFeet: '52.5 ft W × 49.2 ft H × 21.3 ft D',
    floors: 4,
    baseElevationFeet: -25,
    facadeMaterial: 'Interior Plaster Walls, 3-Panel Bay Window & Exterior Brick Return',
    colorHex: 0x594a42,
    trimColorHex: 0xd6cfc2,
    blenderNotes: 'Model Jeff’s full interior room because over-the-shoulder shots (Grace Kelly / Thelma Ritter) look from inside the room out across the courtyard.',
  },
  {
    id: 'bldg_courtyard_pit',
    code: 'BLDG-07',
    name: 'Excavated Subterranean Courtyard Garden & Retaining Walls',
    role: 'Multi-level concrete patio, flowerbeds (Thorwald’s burial spot), brick steps, and clothesline poles',
    positionMeters: [0, -7.8, 2.0],
    sizeMeters: [21.0, 0.4, 34.0],
    dimensionsFeet: '68.9 ft W × 25.0 ft Excavated Depth × 111.5 ft L',
    floors: 1,
    baseElevationFeet: -25,
    facadeMaterial: 'Flagstone Paving, Soil Flowerbed, Retaining Brick & Ivy',
    colorHex: 0x3f4238,
    trimColorHex: 0x6b705c,
    blenderNotes: 'Excavated 25 ft below the Stage 18 floor. Use Blender Geometry Nodes to scatter ivy, flowerbed zinnias, and sagging clotheslines between buildings.',
  },
];

export const APARTMENTS: ApartmentSpec[] = [
  {
    id: 'apt_thorwald_living',
    code: 'APT-2B (North)',
    name: 'Lars & Anna Thorwald — Living & Bedroom Suite',
    occupant: 'Lars Thorwald (Raymond Burr) & Anna Thorwald',
    buildingId: 'bldg_main_north',
    buildingName: '125 W. 9th St. Main Red-Brick Tenement',
    floor: 2,
    elevationFeet: 0, // Directly level with Jeff's 2nd-floor window!
    positionMeters: [-2.2, 0.2, -12.6],
    windowSizeMeters: [5.8, 2.1],
    distanceFromJeffFeet: 112,
    horizontalAngleDeg: -3.7,
    verticalAngleDeg: -0.3,
    lodTier: 'tier1_hero',
    estimatedTris: 185000,
    estimatedVramMb: 420,
    cyclesPortals: 3,
    keyProps: [
      'Sample case & costume jewelry kit',
      '1950s floral wallpaper & hallway door',
      'Bedstead with satin quilt & bedside telephone',
      'Cigarette ember shader (emissive point source for night scene)',
    ],
    lightingNotes: 'Requires 3 Cycles Light Portals across the living room and bedroom windows, plus a switchable 2700K practical table lamp and a 0.015m emissive sphere for Thorwald’s glowing cigar/cigarette in the dark.',
    blenderApproach: 'Author as a single continuous multi-room interior collection (`APT_Thorwald.blend`) spanning 3 window bays so camera pans follow Thorwald walking from the hallway to the bedroom.',
    isHero: true,
  },
  {
    id: 'apt_miss_torso',
    code: 'APT-2E (East)',
    name: 'Miss Torso’s Ballet Studio Apartment',
    occupant: 'Miss Torso (Georgine Darcy)',
    buildingId: 'bldg_east_stucco',
    buildingName: 'East Stucco & Veranda Wing',
    floor: 2,
    elevationFeet: 1.5,
    positionMeters: [9.2, 0.7, -1.5],
    windowSizeMeters: [4.2, 2.4],
    distanceFromJeffFeet: 81,
    horizontalAngleDeg: 21.8,
    verticalAngleDeg: 0.7,
    lodTier: 'tier1_hero',
    estimatedTris: 145000,
    estimatedVramMb: 340,
    cyclesPortals: 2,
    keyProps: [
      'Mid-century refrigerator & kitchen stove',
      'Three-panel French casement windows',
      'Practice barre & record player',
      'Warm peachy-amber lamp shades',
    ],
    lightingNotes: 'High interior bounce exposure (+1.2 EV relative to neighboring rooms). Use Blender Light Linking to brighten her interior walls with a hidden 3200K area fill without washing out the exterior stucco balcony.',
    blenderApproach: 'Full Tier-1 hero interior with clear glass (`IOR 1.52`, `roughness 0.03`) and animated sheer curtains using cloth vertex pinning.',
    isHero: true,
  },
  {
    id: 'apt_composer',
    code: 'APT-4N (Penthouse)',
    name: 'The Songwriter’s Penthouse Studio',
    occupant: 'Ross Bagdasarian (The Composer)',
    buildingId: 'bldg_composer_studio',
    buildingName: 'North-East Atelier Building',
    floor: 4,
    elevationFeet: 18.5,
    positionMeters: [11.2, 5.8, -13.2],
    windowSizeMeters: [4.8, 3.2],
    distanceFromJeffFeet: 121,
    horizontalAngleDeg: 17.9,
    verticalAngleDeg: 8.8,
    lodTier: 'tier1_hero',
    estimatedTris: 160000,
    estimatedVramMb: 380,
    cyclesPortals: 2,
    keyProps: [
      'Baby grand piano in lacquered ebony',
      'Double-height industrial steel north-light window',
      'Sheet music stands & cocktail glassware',
      'Blue-tinted evening skyline reflection',
    ],
    lightingNotes: 'Because the studio glass is massive (4.8m × 3.2m), place a single large Cycles Light Portal matching the steel frame and add an interior 3400K chandelier light group.',
    blenderApproach: 'Tier-1 hero room. Tilt the upper window panes slightly inward so they reflect the warm courtyard below rather than the black studio ceiling.',
    isHero: true,
  },
  {
    id: 'apt_miss_lonelyhearts',
    code: 'APT-1W (Garden)',
    name: 'Miss Lonelyhearts’ Ground-Floor Apartment',
    occupant: 'Miss Lonelyhearts (Judith Evelyn)',
    buildingId: 'bldg_west_brick',
    buildingName: 'West Cream-Brick Tenement',
    floor: 1,
    elevationFeet: -14.0,
    positionMeters: [-9.2, -4.1, 1.5],
    windowSizeMeters: [3.2, 2.2],
    distanceFromJeffFeet: 74,
    horizontalAngleDeg: -24.7,
    verticalAngleDeg: -11.3,
    lodTier: 'tier1_hero',
    estimatedTris: 130000,
    estimatedVramMb: 310,
    cyclesPortals: 2,
    keyProps: [
      'Candlelit dining table for two with silver candelabra',
      'Emerald green wallpaper (Technicolor contrast)',
      'Dressing vanity mirror & Venetian blinds',
      'Bedroom alcove with medicine cabinet',
    ],
    lightingNotes: 'Color-scripted by Hitchcock and Burks with saturated blue-green walls contrasting warm 2400K candlelight. Ensure Filmic/AgX look preserves the green wall saturation under warm tungsten.',
    blenderApproach: 'Tier-1 hero interior positioned in the excavated courtyard datum (-14 ft below Jeff). Include rigged Venetian blinds with adjustable slat rotation.',
    isHero: true,
  },
  {
    id: 'apt_sculptress',
    code: 'APT-1N (Patio)',
    name: 'The Sculptress’s Basement Studio & Garden',
    occupant: 'The Sculptress ("Hunger" Statue Artist)',
    buildingId: 'bldg_main_north',
    buildingName: '125 W. 9th St. Main Red-Brick Tenement',
    floor: 1,
    elevationFeet: -21.0,
    positionMeters: [3.5, -6.2, -12.6],
    windowSizeMeters: [3.6, 2.3],
    distanceFromJeffFeet: 115,
    horizontalAngleDeg: 5.7,
    verticalAngleDeg: -10.8,
    lodTier: 'tier1_hero',
    estimatedTris: 115000,
    estimatedVramMb: 260,
    cyclesPortals: 1,
    keyProps: [
      'Abstract modern biomorphic sculpture ("Hunger")',
      'Clay modeling stand & sculpting armatures',
      'Sunken concrete patio & flowerbed border',
      'Hearing aid costume prop details',
    ],
    lightingNotes: 'Receives strong downward bounce from the courtyard floor during daytime and cool blue moonlight/street spill at night.',
    blenderApproach: 'Sculpt the biomorphic "Hunger" statue using Blender Sculpt Mode + Remesh, placed right outside her ground-floor patio next to Thorwald’s zinnia flowerbed.',
    isHero: true,
  },
  {
    id: 'apt_dog_couple',
    code: 'APT-3B (North)',
    name: 'Couple with the Little Dog (3rd Floor & Fire Escape)',
    occupant: '3rd-Floor Couple (Sara Berner & Frank Cady)',
    buildingId: 'bldg_main_north',
    buildingName: '125 W. 9th St. Main Red-Brick Tenement',
    floor: 3,
    elevationFeet: 10.5,
    positionMeters: [-2.2, 3.4, -12.6],
    windowSizeMeters: [4.2, 2.0],
    distanceFromJeffFeet: 113,
    horizontalAngleDeg: -3.7,
    verticalAngleDeg: 4.9,
    lodTier: 'tier1_hero',
    estimatedTris: 95000,
    estimatedVramMb: 210,
    cyclesPortals: 2,
    keyProps: [
      'Wrought-iron fire escape landing & folding mattress',
      'Wicker basket on pulley rope (lowered into courtyard)',
      '1950s bedroom bureau & lace curtains',
    ],
    lightingNotes: 'Key exterior action occurs on the iron fire escape outside the window; add a subtle rim light from the upper Stage 18 scaffold to separate the pulley basket from the red brick.',
    blenderApproach: 'Model the wrought-iron fire escape with modular array modifiers and curve-guided pulley rope descending to the `-25 ft` flowerbed.',
    isHero: true,
  },
  {
    id: 'apt_newlyweds',
    code: 'APT-2S (South-East)',
    name: 'The Newlyweds’ Corner Apartment',
    occupant: 'Honeymooning Couple (Rand Harper & Havis Davenport)',
    buildingId: 'bldg_east_stucco',
    buildingName: 'East Stucco & Veranda Wing',
    floor: 2,
    elevationFeet: 1.5,
    positionMeters: [9.2, 0.7, 8.5],
    windowSizeMeters: [2.8, 2.2],
    distanceFromJeffFeet: 52,
    horizontalAngleDeg: 35.8,
    verticalAngleDeg: 1.1,
    lodTier: 'tier2_parallax',
    estimatedTris: 28000,
    estimatedVramMb: 85,
    cyclesPortals: 1,
    keyProps: [
      'Opaque roller window shade (pulled down for 90% of film)',
      'Backlit silhouette shader with translucent subsurface scattering',
      '1950s bedroom wallpaper & ceiling fixture',
    ],
    lightingNotes: 'Uses a custom Cycles Principled BSDF with Subsurface/Transmission on the drawn roller blind so warm interior light casts soft silhouettes onto the shade.',
    blenderApproach: 'Tier-2 shallow room (2.5m depth) because the roller shade remains drawn after their initial arrival.',
    isHero: true,
  },
  {
    id: 'apt_jeff_home',
    code: 'APT-2J (Camera Origin)',
    name: 'L.B. "Jeff" Jefferies’ Greenwich Village Apartment',
    occupant: 'L.B. Jefferies (James Stewart), Lisa Fremont (Grace Kelly), Stella (Thelma Ritter)',
    buildingId: 'bldg_jeff_south',
    buildingName: 'South Building (Stage 18 Floor Level)',
    floor: 2,
    elevationFeet: 0,
    positionMeters: [0, 0.4, 21.5],
    windowSizeMeters: [4.6, 2.4],
    distanceFromJeffFeet: 0,
    horizontalAngleDeg: 0,
    verticalAngleDeg: 0,
    lodTier: 'tier1_hero',
    estimatedTris: 240000,
    estimatedVramMb: 520,
    cyclesPortals: 3,
    keyProps: [
      'Wheelchair & plaster leg cast ("Here lie the broken bones of L.B. Jefferies")',
      'Exakta VX 35mm SLR + Kilfitt Fern-Kilar 400mm f/5.6 telephoto lens',
      ' flashbulb gun & four incandescent table lamps (turned on by Lisa)',
      'Framed negative transparencies, Parisian fashion magazines & tripod',
    ],
    lightingNotes: 'At night, when Thorwald confronts Jeff, the room is pitch-dark except for courtyard spill and bursts of 5500K flashbulb illumination that temporarily blind the viewer.',
    blenderApproach: 'Full hero foreground environment. Parent the virtual POV camera rig to an Empty locator at `[0, 0.4m, 21.5m]` inside the three-panel bay window.',
    isHero: true,
  },
  {
    id: 'apt_rooftop_sunbathers',
    code: 'ROOF-5N (North Roof)',
    name: 'Main Tenement Rooftop & Two Female Sunbathers',
    occupant: 'Rooftop Sunbathers & Pigeons',
    buildingId: 'bldg_main_north',
    buildingName: '125 W. 9th St. Main Red-Brick Tenement',
    floor: 5,
    elevationFeet: 32.5,
    positionMeters: [4.2, 10.2, -14.0],
    windowSizeMeters: [6.0, 1.8],
    distanceFromJeffFeet: 123,
    horizontalAngleDeg: 6.7,
    verticalAngleDeg: 15.1,
    lodTier: 'tier2_parallax',
    estimatedTris: 42000,
    estimatedVramMb: 110,
    cyclesPortals: 0,
    keyProps: [
      'Cedar rooftop water tank on steel trestle',
      'Brick chimneys, tar-paper parapet & TV antennas',
      'Beach towels & folding lawn chairs',
    ],
    lightingNotes: 'Directly beneath Stage 18’s overhead carbon-arc sky grid; receives the strongest top-down sunlight and sky fill.',
    blenderApproach: 'Detail the parapet, chimneys, and water tower as real geometry because telephoto tilts up to the roof.',
    isHero: true,
  },
  {
    id: 'apt_parallax_cluster_north',
    code: 'APT-4A..5D (12 Units)',
    name: 'Upper North & West Tenement Background Apartments (12 Units)',
    occupant: 'Background Village Tenants',
    buildingId: 'bldg_main_north',
    buildingName: '125 W. 9th St. & West Tenement Upper Floors',
    floor: 4,
    elevationFeet: 21.0,
    positionMeters: [-5.5, 6.6, -12.6],
    windowSizeMeters: [1.6, 1.9],
    distanceFromJeffFeet: 116,
    horizontalAngleDeg: -8.9,
    verticalAngleDeg: 10.2,
    lodTier: 'tier2_parallax',
    estimatedTris: 36000,
    estimatedVramMb: 95,
    cyclesPortals: 0,
    keyProps: [
      'OSL / Shader-Node Interior Mapping cubemaps (4 room variations)',
      'Randomized sash-window open height via Object Info -> Random',
      'Sheer lace curtain planes with alpha-hashed translucency',
    ],
    lightingNotes: 'Driven purely by shader emission (`0.0` to `2.5` emission strength) keyed to the scene’s time-of-day custom property.',
    blenderApproach: 'Do NOT model 3D furniture inside these 12 secondary apartments. Use a single quad behind the window glass with a Parallax Interior Mapping node group.',
    isHero: false,
  },
  {
    id: 'apt_curtain_cluster_east_west',
    code: 'APT-3E..4W (10 Units)',
    name: 'Peripheral Flank & Alleyway Windows (10 Units)',
    occupant: 'Peripheral Tenement Units',
    buildingId: 'bldg_east_stucco',
    buildingName: 'East & West Peripheral Walls & Alleyway',
    floor: 3,
    elevationFeet: 11.5,
    positionMeters: [9.2, 3.8, -9.5],
    windowSizeMeters: [1.5, 1.8],
    distanceFromJeffFeet: 106,
    horizontalAngleDeg: 16.5,
    verticalAngleDeg: 6.1,
    lodTier: 'tier3_curtain',
    estimatedTris: 12000,
    estimatedVramMb: 40,
    cyclesPortals: 0,
    keyProps: [
      'Venetian blind & roller-shade variation instances',
      'Window sill flowerpots & milk bottles (Geometry Nodes)',
    ],
    lightingNotes: 'Zero interior lights required; subtle warm backlight mapped on 30% of windows at night.',
    blenderApproach: 'Tier-3 lightweight window cards instanced via Blender Collection Instances to keep total scene VRAM well under 4 GB.',
    isHero: false,
  },
];

export const OPTICAL_PRESETS: OpticalPreset[] = [
  {
    id: 'lens_35mm_stage',
    name: '35mm Wide Contextual Pan',
    focalLengthMm: 35,
    cameraSystem: 'Paramount Mitchell BNC (35mm Academy Aperture)',
    sensorWidthMm: 22.0,
    sensorHeightMm: 16.0,
    aspectRatio: '1.66:1',
    fStop: 4.0,
    narrativeUse: 'Opening crane/pan establishing shots revealing the full verticality of the courtyard from the sunken garden up to the rooftop water tank.',
    fSpyNotes: 'Ideal for fSpy Master Blockout Calibration: provides strong converging X, Y, and Z vanishing lines across multiple building facades.',
  },
  {
    id: 'lens_50mm_jeff_eye',
    name: '50mm Natural Eye POV',
    focalLengthMm: 50,
    cameraSystem: 'Paramount Mitchell BNC (35mm Academy Aperture)',
    sensorWidthMm: 22.0,
    sensorHeightMm: 16.0,
    aspectRatio: '1.66:1',
    fStop: 2.8,
    narrativeUse: 'Jeff’s unaided naked-eye perspective looking out from his wheelchair across the 112-foot gap to Thorwald’s building.',
    fSpyNotes: 'Use to verify the relative scale between Jeff’s foreground bay-window frames and the 125 W. 9th St. brick tenement across the yard.',
  },
  {
    id: 'lens_75mm_binoculars',
    name: '75mm–100mm Binocular Inspection',
    focalLengthMm: 85,
    cameraSystem: 'Bausch & Lomb 7×35 Binoculars Simulation',
    sensorWidthMm: 22.0,
    sensorHeightMm: 16.0,
    aspectRatio: '1.66:1',
    fStop: 4.0,
    narrativeUse: 'Medium-telephoto framing isolating a single two-window apartment unit (e.g., framing both windows of Thorwald’s apartment simultaneously).',
    fSpyNotes: 'Pair with a subtle compositor double-circle vignette mask when recreating binocular POV shots.',
  },
  {
    id: 'lens_400mm_exakta',
    name: '400mm Exakta VX Telephoto',
    focalLengthMm: 200, // Equivalent framing in 22mm Academy / 400mm full-frame telephoto look
    cameraSystem: 'Exakta VX 35mm SLR + Kilfitt Fern-Kilar 400mm f/5.6',
    sensorWidthMm: 36.0,
    sensorHeightMm: 24.0,
    aspectRatio: '1.66:1',
    fStop: 5.6,
    narrativeUse: 'Extreme voyeuristic close-up isolating a single window pane, Thorwald’s hands cleaning the saw, or Anna’s wedding ring.',
    fSpyNotes: 'WARNING: Never run fSpy primary axis calibration on 400mm shots—perspective lines are nearly parallel, causing focal-length solver instability. Lock camera position from the 35mm solve and dial focal length manually.',
  },
];

export const LIGHTING_PRESETS: LightingPreset[] = [
  {
    id: 'morning',
    name: 'Morning Heatwave (9:00 AM)',
    timeLabel: '09:00 EST · 94°F Greenwich Village Heatwave',
    kelvinKey: 5400,
    kelvinFill: 6800,
    sunElevationDeg: 48,
    sunAzimuthDeg: -38,
    sunIntensity: 3.2,
    ambientSkyHex: 0x9ec5e8,
    ambientGroundHex: 0x7d6552,
    ambientIntensity: 0.85,
    fogHex: 0x262b34,
    windowPracticalIntensity: 0.15,
    arcUnitsActive: '140 Overhead Brute Carbon Arcs + White Muslin Sky Cyc',
    cyclesWorldNotes: 'Set Nishita Sky Texture to Sun Elevation 48°, Air 1.8, Dust 2.4 for hazy New York summer humidity. Enable Light Portals on all 9 hero apartments.',
    technicolorGradingNotes: 'High daylight key contrast with warm skin/brick reds and crisp cyan shadow separation.',
  },
  {
    id: 'afternoon',
    name: 'Golden Hour Courtyard (5:30 PM)',
    timeLabel: '17:30 EST · Long Diagonal Courtyard Shadows',
    kelvinKey: 3800,
    kelvinFill: 6200,
    sunElevationDeg: 22,
    sunAzimuthDeg: 42,
    sunIntensity: 2.6,
    ambientSkyHex: 0xdba374,
    ambientGroundHex: 0x4f3a2d,
    ambientIntensity: 0.65,
    fogHex: 0x241d1a,
    windowPracticalIntensity: 0.85,
    arcUnitsActive: '85 Amber-Gelled Senior Solarspots + Warm Bounce Tarps',
    cyclesWorldNotes: 'Low diagonal sun rakes across the North red-brick facade, casting long fire-escape shadows while throwing the `-25 ft` lower garden pit into cool blue-violet shade.',
    technicolorGradingNotes: 'Iconic 1954 Technicolor three-strip warmth: rich terracotta brick, golden ochre stucco, and emerging warm tungsten practical lamps indoors.',
  },
  {
    id: 'dusk',
    name: 'Dusk Neon & Practical Lamps (8:15 PM)',
    timeLabel: '20:15 EST · Twilight Blue Hour & Interior Glow',
    kelvinKey: 7500,
    kelvinFill: 8200,
    sunElevationDeg: 8,
    sunAzimuthDeg: 60,
    sunIntensity: 0.55,
    ambientSkyHex: 0x2e456e,
    ambientGroundHex: 0x1a1e29,
    ambientIntensity: 0.45,
    fogHex: 0x111622,
    windowPracticalIntensity: 2.4,
    arcUnitsActive: 'Blue-Gelled Overhead Skypans + 31 Individual Apartment Switchboards',
    cyclesWorldNotes: 'Hero apartments become the primary light emitters! Use Cycles Light Linking so each apartment’s 2700K–3200K area lamps illuminate its room and cast soft warm rectangles onto the courtyard floor.',
    technicolorGradingNotes: 'Deep Prussian-blue exterior brickwork balanced against saturated amber, emerald (Miss Lonelyhearts), and peach (Miss Torso) window interiors.',
  },
  {
    id: 'night_flash',
    name: 'Midnight Suspense & Cigar Ember (1:30 AM)',
    timeLabel: '01:30 EST · Blackout Courtyard & Flashbulb Climax',
    kelvinKey: 8500,
    kelvinFill: 9000,
    sunElevationDeg: 35,
    sunAzimuthDeg: 0,
    sunIntensity: 0.22,
    ambientSkyHex: 0x162038,
    ambientGroundHex: 0x0c0e14,
    ambientIntensity: 0.25,
    fogHex: 0x090b10,
    windowPracticalIntensity: 1.35,
    arcUnitsActive: 'Dimmed Moonlight Arcs + Targeted Pin-Spots on Thorwald’s Window',
    cyclesWorldNotes: 'Turn off Thorwald’s room lamps to isolate his 0.015m emissive red cigar ember (`Emission Strength: 45`, `Color: #FF2A00`). Keyframe a 5500K SpotLight at Jeff’s wheelchair for the defensive flashbulb bursts.',
    technicolorGradingNotes: 'Crushed velvety Technicolor blacks with pinpoint specular reflections on glass panes and wrought-iron fire escapes.',
  },
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'phase_1_fspy',
    stepNumber: '01',
    title: 'Reference Gathering & Two-Pass fSpy Calibration',
    subtitle: 'Solving camera focal lengths and locking the nodal point inside Jeff’s bay window',
    summary:
      'Because 98% of Rear Window is shot from inside L.B. Jefferies’ apartment, camera matching is your foundational anchor. However, calibrating fSpy on a 400mm telephoto frame will fail due to parallel vanishing lines. You must use a Two-Pass Camera Solver strategy.',
    keyMetrics: 'Academy Aperture 1.66:1 (22mm × 16mm) · Base Lens 35mm/50mm · Telephoto 400mm',
    blenderTools: ['fSpy Importer Add-on', 'Camera Background Images', 'Nodal Tripod Empty Rig'],
    technicalInstructions: [
      {
        heading: 'Pass 1: Wide Establishing Frame in fSpy',
        detail:
          'Select the opening crane-in or wide 35mm panning frames where the North red-brick facade and either the East or West wing meet at a 90° corner. Align fSpy X-axis lines along the limestone window lintels and Z-axis lines along vertical brick corners and drainpipes.',
        blenderSetting: 'fSpy Sensor: Custom 22.0mm × 16.0mm (1954 35mm Academy Gate)',
      },
      {
        heading: 'Pass 2: Nodal Pivot Rig in Blender',
        detail:
          'Import the fSpy camera into Blender and parent it to an Empty (`RIG_Jeff_Tripod`) at `[X: 0m, Y: -21.5m, Z: 0.4m]`. For all 75mm binocular and 400mm Exakta shots, duplicate this camera and animate ONLY rotation (Pan/Tilt) and Focal Length—never translate the camera out into the courtyard.',
        blenderSetting: 'Object Properties -> Transform Locks -> Lock Location X/Y/Z on Telephoto Cam',
      },
      {
        heading: 'Pass 3: Distortion & Aspect Verification',
        detail:
          'Set Blender Output Resolution to 3984 × 2400 (exact 1.66:1 Paramount widescreen ratio) and load high-res film stills at 40% opacity in Camera Background Images with Depth set to Front.',
        blenderSetting: 'Output Properties -> Format -> 3984 × 2400 px (1.66:1)',
      },
    ],
    pitfallToAvoid:
      'Never run fSpy vanishing-point calibration on close-up shots of Thorwald’s window (shot on the 400mm Kilfitt lens). Telephoto compression flattens perspective so severely that fSpy will miscalculate camera distance by 300%+.',
    checklistItems: [
      { id: 'chk_1_1', label: 'Install fSpy-Blender importer and configure 22mm × 16mm Academy sensor preset', category: 'Phase 1' },
      { id: 'chk_1_2', label: 'Calibrate master courtyard axes using wide 35mm/50mm corner frame', category: 'Phase 1' },
      { id: 'chk_1_3', label: 'Create RIG_Jeff_Tripod Empty at Z = +0.4m and parent 35mm, 50mm, 85mm, and 400mm cameras', category: 'Phase 1' },
    ],
  },
  {
    id: 'phase_2_blockout',
    stepNumber: '02',
    title: 'Paramount Stage 18 Dimensional Massing & Excavated Datum',
    subtitle: 'Blocking out the 185’ × 98’ × 40’ soundstage volume and the -25’ basement pit',
    summary:
      'Art directors Hal Pereira and Joseph MacMillan Johnson tore out the floor of Paramount Stage 18 and excavated 25 feet down into the subterranean storage basement. Modeling with this exact two-datum elevation system makes Jeff’s sightlines align automatically.',
    keyMetrics: 'Stage: 56.39m × 29.87m × 12.19m · Excavated Pit: Z = -7.62m (-25 ft)',
    blenderTools: ['Scene Unit Scale (Imperial/Metric)', 'Boolean Courtyard Pit', 'Collection Hierarchy'],
    technicalInstructions: [
      {
        heading: 'Two-Datum World Origin Setup',
        detail:
          'Keep Blender’s World Origin `Z = 0.0m` at the true Stage 18 main floor level—which corresponds directly to Jeff’s 2nd-floor apartment and Thorwald’s 2nd-floor apartment directly opposite (`112 ft / 34.1m` away).',
        blenderSetting: 'World Origin Z = 0.0m (2nd Floor Sightline Level)',
      },
      {
        heading: 'Excavating the -7.62m (-25 ft) Courtyard Garden',
        detail:
          'Model the lower courtyard garden, concrete patio, brick stairs, and Sculptress/Miss Lonelyhearts ground-floor entrances descending down to `Z = -7.62m`. This creates the dramatic downward camera pitch when Jeff looks at the dog or flowerbed.',
        blenderSetting: 'Lower Courtyard Floor Z = -7.62m (-25.0 ft)',
      },
      {
        heading: 'Forced-Perspective North Alleyway',
        detail:
          'Between the Main North Tenement and the West Brick Wing, construct the narrow slot alleyway leading out to West 10th Street. Scale the far street buildings and tavern facade down to `0.85×` true scale to match Pereira’s forced-perspective stage depth.',
        blenderSetting: 'Alleyway Backdrop Scale = 0.85 on X/Y/Z',
      },
    ],
    pitfallToAvoid:
      'Do not model all buildings resting on a flat `Z = 0` plane. The courtyard has three distinct terraced levels (street level in the back alley, sunken concrete patio, and lowest flowerbed/garden pit).',
    checklistItems: [
      { id: 'chk_2_1', label: 'Generate Stage 18 wireframe bounding box (56.39m × 29.87m × 12.19m)', category: 'Phase 2' },
      { id: 'chk_2_2', label: 'Block out the -7.62m (-25 ft) excavated courtyard garden & retaining steps', category: 'Phase 2' },
      { id: 'chk_2_3', label: 'Place all 7 primary building proxy hulls and verify sightlines from Jeff’s window', category: 'Phase 2' },
    ],
  },
  {
    id: 'phase_3_modular',
    stepNumber: '03',
    title: 'Modular Architectural Kitbashing & UDIM Brick Texturing',
    subtitle: 'Building reusable Greenwich Village window bays, fire escapes, and weathered shaders',
    summary:
      'Rather than box-modeling 31 windows destructively, break the 7 buildings into a snap-grid library of 3.0m × 3.2m architectural wall bays, limestone lintels, double-hung sash windows, and wrought-iron fire escape modules.',
    keyMetrics: 'Modular Grid: 3.0m W × 3.2m H · 4K UDIM Tiles · Object Info Randomization',
    blenderTools: ['Array & Mirror Modifiers', 'UDIM Texture Sets', 'Shader Node AO/Dirt Masks'],
    technicalInstructions: [
      {
        heading: 'Double-Hung Sash Window Rigging',
        detail:
          'Build one hero double-hung sash window with separate upper/lower wooden frames and glass panes (`MeshPhysical` / Principled BSDF with `IOR 1.52`). Drive the lower sash Z-height and roller-blind extension via custom object properties so every window opens to a unique height.',
        blenderSetting: 'Object Info Node -> Random -> Map Range (0.0m to 0.65m Z-Offset)',
      },
      {
        heading: 'Procedural + UDIM Brick Weathering',
        detail:
          'Combine a high-resolution 1950s red-brick base texture with an Ambient Occlusion node and a vertical Z-gradient mask to darken bricks beneath windowsills, fire-escape brackets, and the damp lower courtyard retaining walls.',
        blenderSetting: 'Shader Editor: Ambient Occlusion (Inside: On) -> MixRGB Multiply (Soot)',
      },
      {
        heading: 'Micro-Normal Glass Imperfection for 400mm Shots',
        detail:
          'When zoomed in at 400mm, perfectly flat CG window glass looks fake. Plug a large-scale `Noise Texture (Scale: 1.8, Detail: 1.0)` into a `Bump Node (Strength: 0.012)` on the window glass normal input to create authentic 1950s wavy crown-glass reflections.',
        blenderSetting: 'Glass Material -> Normal: Noise (Scale 1.8) -> Bump (0.012)',
      },
    ],
    pitfallToAvoid:
      'Avoid thick volumetric glass meshes with Boolean cutouts on distant buildings—use single-sided architectural glass planes (`Thin Film / Architectural Glass` trick using Light Path `Is Shadow Ray` + `Fresnel`) to prevent dark refractive edges and speed up Cycles by 40%.',
    checklistItems: [
      { id: 'chk_3_1', label: 'Model modular 3.0m × 3.2m brick wall bay, limestone cornice, and rigged sash window', category: 'Phase 3' },
      { id: 'chk_3_2', label: 'Construct wrought-iron fire escape and pulley basket assembly with Array modifiers', category: 'Phase 3' },
      { id: 'chk_3_3', label: 'Author weathered red-brick, buff-brick, and ochre-stucco PBR materials with AO soot masks', category: 'Phase 3' },
    ],
  },
  {
    id: 'phase_4_interiors',
    stepNumber: '04',
    title: '31-Apartment Interior Strategy: Linked Collections vs. Parallax',
    subtitle: 'Balancing photorealistic Cycles rooms for the 9 hero units with VRAM-friendly background windows',
    summary:
      'Populating 31 fully furnished 1950s apartments in one file will exceed 16 GB of VRAM. Use a three-tier Level of Detail (LOD) architecture leveraging Blender Linked Library Overrides for the 9 hero apartments and Interior Mapping shaders for the remaining 22 units.',
    keyMetrics: '9 Tier-1 Hero Rooms (Linked .blend) · 12 Tier-2 Parallax Units · 10 Tier-3 Curtain Cards',
    blenderTools: ['File -> Link (Collection Instances)', 'Library Overrides', 'Interior Mapping Shader'],
    technicalInstructions: [
      {
        heading: 'Tier 1: Linked Hero Apartments (9 Units)',
        detail:
          'Create dedicated `.blend` files for Thorwald’s 3-window suite, Miss Torso’s studio, the Composer’s penthouse, Miss Lonelyhearts’ room, the Sculptress’s patio studio, the Dog Couple’s room, and Jeff’s foreground apartment. Link each into the master stage scene onto Empty locators.',
        blenderSetting: 'File -> Link -> Collections -> Make Library Override (for light/prop animation)',
      },
      {
        heading: 'Tier 2: Interior Mapping Parallax Quads (12 Units)',
        detail:
          'For upper-floor tenement windows never inspected at 400mm, place a single recessed plane 0.2m behind the window sash using an Interior Mapping node group (projecting 5-wall room cubemaps with randomized furniture/curtain layers).',
        blenderSetting: 'Incoming Vector -> Vector Transform (Object) -> Box Projection Cubemap',
      },
      {
        heading: 'Viewport Proxy Switching',
        detail:
          'Set the Viewport Display of heavy interior furniture collections to `Bounds` while animating cameras or working on exterior courtyard foliage; Cycles will still render the full geometry automatically.',
        blenderSetting: 'Object Properties -> Viewport Display -> Display As: Bounds',
      },
    ],
    pitfallToAvoid:
      'Never use `Alt+D` or unlinked copies for full apartment interiors in the master file—if you need to tweak wallpaper roughness or lamp placement across scenes, Linked Collections update non-destructively everywhere.',
    checklistItems: [
      { id: 'chk_4_1', label: 'Set up external .blend asset files for the 9 Tier-1 hero apartments and link via Empty locators', category: 'Phase 4' },
      { id: 'chk_4_2', label: 'Detail Thorwald’s 3-bay suite (living room, hallway, bedroom) as a continuous interior', category: 'Phase 4' },
      { id: 'chk_4_3', label: 'Assign Parallax Interior Mapping shaders and randomized blinds to the 22 Tier-2/Tier-3 windows', category: 'Phase 4' },
    ],
  },
  {
    id: 'phase_5_lighting',
    stepNumber: '05',
    title: '1954 Technicolor Lighting Rig, Cycles Portals & Light Linking',
    subtitle: 'Recreating Robert Burks’ 4-state soundstage illumination without interior path-tracing noise',
    summary:
      'Cinematographer Robert Burks wired Stage 18 with four master switchboards to transition smoothly from blazing summer morning to golden hour, blue dusk, and pitch-black midnight. In Blender Cycles, combining exterior stage lights with interior rooms requires Light Portals and Light Linking.',
    keyMetrics: '9–15 Cycles Light Portals · Blender 4.x Light Linking · 2700K–8500K Color Script',
    blenderTools: ['Area Light -> Portal', 'Blender 4.x Light Linking', 'Blackbody Kelvin Node'],
    technicalInstructions: [
      {
        heading: 'Mandatory Cycles Light Portals on Hero Windows',
        detail:
          'Place a rectangular Blender Area Light directly over the exterior window opening of each Tier-1 hero apartment, check `Portal` in Light Properties, and point its normal vector `-Z` inward into the room. This cuts interior Cycles noise by up to 70% during daytime renders.',
        blenderSetting: 'Light Properties -> Area -> Shape: Rectangle -> [x] Portal',
      },
      {
        heading: 'Per-Apartment Light Linking (Blender 4.x)',
        detail:
          'In theatrical reality (and Hitchcock’s film), interior rooms are lit slightly hotter than a single 60W table lamp would physically achieve so they read clearly from 112 feet away. Add an invisible 3000K Area Fill inside each hero room and use Light Linking so it illuminates ONLY that apartment’s collection.',
        blenderSetting: 'Object Properties -> Shading -> Light Linking -> Include: COL_Apt_Thorwald',
      },
      {
        heading: 'Thorwald’s Cigar Ember & Jeff’s Flashbulb Rig',
        detail:
          'For the iconic dark bedroom scene, model a 15mm sphere at Thorwald’s chair with an `Emission Shader (Strength: 45, Blackbody: 1600K)` paired with a miniature 0.5W Point Light restricted to his face/hands. At Jeff’s wheelchair, rig a 5500K SpotLight (`Angle: 65°`, `Power: 8000W`) keyframed over 3 frames for the flashbulb bursts.',
        blenderSetting: 'Cigar Ember: Emission 45.0 + PointLight 0.5W (Radius 0.02m)',
      },
    ],
    pitfallToAvoid:
      'Do not enable `Portal` on interior practical lamps—Portals emit zero light of their own and only guide environment/sky rays through small openings. Only enable `Portal` on the window-frame Area Lights.',
    checklistItems: [
      { id: 'chk_5_1', label: 'Place inward-facing Cycles Area Light Portals on all 9 hero apartment window frames', category: 'Phase 5' },
      { id: 'chk_5_2', label: 'Configure 4 Scene World / Light Group presets (Morning, Golden Hour, Dusk, Midnight)', category: 'Phase 5' },
      { id: 'chk_5_3', label: 'Set up Blender 4.x Light Linking for interior apartment fill lights and Thorwald’s cigar ember', category: 'Phase 5' },
    ],
  },
  {
    id: 'phase_6_compositing',
    stepNumber: '06',
    title: 'Cycles Render Optimization, Light Groups & Three-Strip Technicolor Grading',
    subtitle: 'Multi-pass OpenEXR compositing, optical lens effects, and 1954 dye-transfer color science',
    summary:
      'Finalizing the render requires tuning Cycles path depths for multi-pane glass, exporting Light Group passes so every apartment’s brightness can be mixed live in the Compositor without re-rendering, and applying Three-Strip Technicolor dye-transfer curves.',
    keyMetrics: 'Max Bounces: 12 · Transmission Bounces: 12 · OpenEXR DWAA · AgX + Technicolor Curve',
    blenderTools: ['Cycles Light Groups', 'OpenImageDenoise (Albedo + Normal)', 'Compositor Glare & Lens Distortion'],
    technicalInstructions: [
      {
        heading: 'Cycles Light Paths & Glass Shadow Trick',
        detail:
          'Set Transmission Bounces to `12` and Transparent Max Bounces to `16` so rays pass cleanly through Jeff’s foreground bay window, across the courtyard, and through Thorwald’s window glass without turning black.',
        blenderSetting: 'Render Properties -> Light Paths -> Transmission: 12, Transparent: 16',
      },
      {
        heading: 'Cycles Light Groups for Interactive Relighting',
        detail:
          'Assign your Sky/Sun rig to `LG_Courtyard_Sky`, Thorwald’s lights to `LG_Thorwald`, Miss Torso’s to `LG_Torso`, and the Composer’s to `LG_Composer`. You can then animate day-to-night transitions or dim individual apartments right in the Blender Compositor.',
        blenderSetting: 'View Layer Properties -> Passes -> Light Groups -> Add Per-Apartment Group',
      },
      {
        heading: '1954 Technicolor Dye-Transfer & Optical Halations',
        detail:
          'Under Color Management, use `AgX` with `Medium High Contrast`. In the Compositor, add a subtle `Glare (Fog Glow, Threshold: 0.9, Size: 7)` for warm window halation, a `Lens Distortion (Dispersion: 0.008)` for the 400mm Kilfitt telephoto edges, and an S-curve boosting red-orange brick warmth against deep cyan-blue shadows.',
        blenderSetting: 'Color Management -> View Transform: AgX | Look: Medium High Contrast',
      },
    ],
    pitfallToAvoid:
      'If your hero apartment interiors look dark or black when viewed through Jeff’s closed window AND the neighbor’s closed window, your `Transmission Bounces` is too low (minimum 8–12 required) or `Shadow Caustics / Architectural Glass Transparent Shadows` is disabled.',
    checklistItems: [
      { id: 'chk_6_1', label: 'Set Cycles Transmission/Transparent bounces to 12+ and enable Architectural Glass shadow bypass', category: 'Phase 6' },
      { id: 'chk_6_2', label: 'Assign View Layer Light Groups for Courtyard Sky and each Hero Apartment', category: 'Phase 6' },
      { id: 'chk_6_3', label: 'Build Compositor tree with Light Group mixer, Fog Glow halation, and 1954 Technicolor RGB curves', category: 'Phase 6' },
    ],
  },
];
