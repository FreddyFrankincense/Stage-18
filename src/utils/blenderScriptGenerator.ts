import { APARTMENTS, BUILDINGS, JEFF_CAMERA_ORIGIN_METERS, STAGE_18_SPECS } from '../data/stage18Data';

export interface ScriptGeneratorConfig {
  unitSystem: 'IMPERIAL' | 'METRIC';
  includeStageCage: boolean;
  includeExcavatedPit: boolean;
  includeBuildingHulls: boolean;
  includeHeroApartmentEmpties: boolean;
  includeCyclesPortals: boolean;
  includeJeffCameraRig: boolean;
  configureCyclesSettings: boolean;
  lightingPreset: 'morning' | 'afternoon' | 'dusk' | 'night_flash';
}

export function generateBlenderPythonScript(config: ScriptGeneratorConfig): string {
  const buildingDefs = BUILDINGS.filter((b) => b.id !== 'bldg_courtyard_pit')
    .map(
      (b) =>
        `    {
        "name": "${b.code}_${b.id}",
        "label": "${b.name.replace(/"/g, '\\"')}",
        "pos": (${b.positionMeters[0].toFixed(2)}, ${(-b.positionMeters[2]).toFixed(2)}, ${(b.positionMeters[1] + b.sizeMeters[1] / 2).toFixed(2)}),
        "size": (${b.sizeMeters[0].toFixed(2)}, ${b.sizeMeters[2].toFixed(2)}, ${b.sizeMeters[1].toFixed(2)}),
        "color": (${((b.colorHex >> 16) & 255) / 255}, ${((b.colorHex >> 8) & 255) / 255}, ${(b.colorHex & 255) / 255}, 1.0),
    }`
    )
    .join(',\n');

  const heroApartments = APARTMENTS.filter((a) => a.isHero)
    .map(
      (a) =>
        `    {
        "code": "${a.code.replace(/[^a-zA-Z0-9_-]/g, '_')}",
        "name": "${a.name.replace(/"/g, '\\"')}",
        "pos": (${a.positionMeters[0].toFixed(2)}, ${(-a.positionMeters[2]).toFixed(2)}, ${a.positionMeters[1].toFixed(2)}),
        "win_size": (${a.windowSizeMeters[0].toFixed(2)}, ${a.windowSizeMeters[1].toFixed(2)}),
        "portals": ${a.cyclesPortals},
    }`
    )
    .join(',\n');

  return `# ==============================================================================
# REAR WINDOW (1954) — PARAMOUNT STAGE 18 MASTER BLOCKOUT GENERATOR
# Target Software : Blender 4.0+ (Cycles Render Engine)
# Art Direction   : Hal Pereira & Joseph MacMillan Johnson (185' x 98' x 40' Set)
# Datum Strategy  : Z = 0.0m is Stage 18 Floor (Jeff's 2nd-Floor Window Level)
#                   Z = -7.62m (-25.0 ft) is the Excavated Courtyard Garden Pit
# ==============================================================================

import bpy
import math
from mathutils import Vector, Euler

def get_or_create_collection(name, parent=None):
    if name in bpy.data.collections:
        col = bpy.data.collections[name]
    else:
        col = bpy.data.collections.new(name)
        target_parent = parent if parent else bpy.context.scene.collection
        target_parent.children.link(col)
    return col

def create_pbr_material(name, rgba, roughness=0.78):
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = rgba
        bsdf.inputs["Roughness"].default_value = roughness
    return mat

def build_stage18_scene():
    scene = bpy.context.scene

    # 1. Configure Units (${config.unitSystem})
    scene.unit_settings.system = '${config.unitSystem}'
    scene.unit_settings.scale_length = 1.0
    ${
      config.unitSystem === 'IMPERIAL'
        ? "scene.unit_settings.length_unit = 'FEET'"
        : "scene.unit_settings.length_unit = 'METERS'"
    }

    # 2. Create Master Collection Hierarchy
    col_root = get_or_create_collection("STAGE18_Rear_Window_Master")
    col_stage = get_or_create_collection("01_Stage18_Bounds_And_Pit", col_root)
    col_bldgs = get_or_create_collection("02_Building_Massing_Hulls", col_root)
    col_apts  = get_or_create_collection("03_Hero_Apartment_Locators", col_root)
    col_lights = get_or_create_collection("04_Cycles_Portals_And_Rig", col_root)
    col_cams  = get_or_create_collection("05_Jeff_POV_Camera_Rig", col_root)

${
  config.configureCyclesSettings
    ? `    # 3. Configure Cycles & 1954 Academy Aperture (1.66:1)
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 512
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 12
    scene.cycles.transmission_bounces = 12
    scene.cycles.transparent_max_bounces = 16
    scene.render.resolution_x = 3984
    scene.render.resolution_y = 2400
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'
`
    : '    # 3. Cycles configuration skipped per user toggle\n'
}
${
  config.includeStageCage
    ? `    # 4. Paramount Stage 18 Soundstage Wireframe Envelope (185' x 98' x 40')
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 2.0, 2.28))
    stage_cage = bpy.context.active_object
    stage_cage.name = "STAGE18_Envelope_185x98x40ft"
    stage_cage.scale = (${STAGE_18_SPECS.widthMeters.toFixed(2)}, ${STAGE_18_SPECS.lengthMeters.toFixed(2)}, ${(
        STAGE_18_SPECS.heightMeters + STAGE_18_SPECS.excavationDepthMeters
      ).toFixed(2)})
    stage_cage.display_type = 'WIRE'
    stage_cage.hide_render = True
    for c in stage_cage.users_collection:
        c.objects.unlink(stage_cage)
    col_stage.objects.link(stage_cage)
`
    : ''
}
${
  config.includeExcavatedPit
    ? `    # 5. Excavated Subterranean Courtyard Floor (Z = -7.62m / -25.0 ft below Jeff)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -2.0, -7.82))
    pit_floor = bpy.context.active_object
    pit_floor.name = "COURTYARD_Excavated_Pit_Minus25ft"
    pit_floor.scale = (21.0, 34.0, 0.4)
    mat_pit = create_pbr_material("MAT_Courtyard_Flagstone", (0.24, 0.26, 0.22, 1.0), 0.88)
    pit_floor.data.materials.append(mat_pit)
    for c in pit_floor.users_collection:
        c.objects.unlink(pit_floor)
    col_stage.objects.link(pit_floor)
`
    : ''
}
${
  config.includeBuildingHulls
    ? `    # 6. Construct the 7 Greenwich Village Building Massing Hulls
    buildings_data = [
${buildingDefs}
    ]

    for b in buildings_data:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=b["pos"])
        obj = bpy.context.active_object
        obj.name = b["name"]
        obj.scale = b["size"]
        mat = create_pbr_material("MAT_" + b["name"], b["color"], roughness=0.82)
        obj.data.materials.append(mat)
        for c in obj.users_collection:
            c.objects.unlink(obj)
        col_bldgs.objects.link(obj)
`
    : ''
}
${
  config.includeHeroApartmentEmpties
    ? `    # 7. Create Empty Locators for Linked Hero Apartment Collections (.blend)
    hero_apartments = [
${heroApartments}
    ]

    for apt in hero_apartments:
        empty = bpy.data.objects.new("LOC_" + apt["code"], None)
        empty.empty_display_type = 'CUBE'
        empty.empty_display_size = 1.25
        empty.location = apt["pos"]
        empty["occupant_title"] = apt["name"]
        col_apts.objects.link(empty)
${
  config.includeCyclesPortals
    ? `
        # Create Cycles Area Light Portal over hero apartment window
        if apt["portals"] > 0:
            light_data = bpy.data.lights.new(name="PORTAL_" + apt["code"], type='AREA')
            light_data.shape = 'RECTANGLE'
            light_data.size = apt["win_size"][0]
            light_data.size_y = apt["win_size"][1]
            light_data.cycles.is_portal = True
            light_obj = bpy.data.objects.new(name="PORTAL_" + apt["code"], object_data=light_data)
            light_obj.location = apt["pos"]
            light_obj.rotation_euler = Euler((math.radians(-90.0), 0.0, 0.0), 'XYZ')
            col_lights.objects.link(light_obj)
`
    : ''
}`
    : ''
}
${
  config.includeJeffCameraRig
    ? `    # 8. L.B. "Jeff" Jefferies' Nodal Wheelchair Camera Rig (Z = +0.4m Datum)
    rig_origin = Vector((${JEFF_CAMERA_ORIGIN_METERS[0].toFixed(2)}, ${(-JEFF_CAMERA_ORIGIN_METERS[2]).toFixed(2)}, ${JEFF_CAMERA_ORIGIN_METERS[1].toFixed(2)}))
    tripod_empty = bpy.data.objects.new("RIG_Jeff_Wheelchair_Nodal_Origin", None)
    tripod_empty.empty_display_type = 'SPHERE'
    tripod_empty.empty_display_size = 0.6
    tripod_empty.location = rig_origin
    col_cams.objects.link(tripod_empty)

    lens_configs = [
        ("CAM_01_Wide_35mm_Mitchell", 35.0, 22.0, 16.0, 4.0),
        ("CAM_02_Normal_50mm_JeffPOV", 50.0, 22.0, 16.0, 2.8),
        ("CAM_03_Binoculars_85mm", 85.0, 22.0, 16.0, 4.0),
        ("CAM_04_Exakta_400mm_Kilfitt", 400.0, 36.0, 24.0, 5.6),
    ]

    for cam_name, focal_mm, sens_w, sens_h, fstop in lens_configs:
        cam_data = bpy.data.cameras.new(cam_name)
        cam_data.lens = focal_mm
        cam_data.sensor_fit = 'HORIZONTAL'
        cam_data.sensor_width = sens_w
        cam_data.sensor_height = sens_h
        cam_data.dof.use_dof = True
        cam_data.dof.aperture_fstop = fstop
        cam_data.dof.focus_distance = 34.14  # 112 ft to Thorwald's window

        cam_obj = bpy.data.objects.new(cam_name, cam_data)
        cam_obj.parent = tripod_empty
        cam_obj.location = (0.0, 0.0, 0.0)
        cam_obj.rotation_euler = Euler((math.radians(90.0), 0.0, 0.0), 'XYZ')
        # Lock location so telephoto pan/tilt stays true to nodal origin
        cam_obj.lock_location = (True, True, True)
        col_cams.objects.link(cam_obj)

        if focal_mm == 50.0:
            scene.camera = cam_obj
`
    : ''
}
    print("Stage 18 Rear Window (1954) Master Blockout generated successfully.")

if __name__ == "__main__":
    build_stage18_scene()
`;
}
