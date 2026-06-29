// =============================================================================
//  FUENTE ÚNICA DE VERDAD  —  Bodega NIUTEC SA de CV
//  Col. Ex-Hacienda de la Sangre de Cristo, Oaxaca de Juárez.
//  Plano arquitectónico ARQ.-1 (Agosto 2024, esc. 1:125).
//  Todas las medidas en METROS.
//
//  Coordenadas:  X = este(+)/oeste(−) ,  Z = sur(+, patio/calle)/norte(−, fondo) ,
//  Y = altura.  Origen en el CENTRO de la nave (bodega).
//
//  Nave (bodega): 25.65 (X, ejes A-C) × 30.30 (Z, ejes 1-6, claros de 6.06).
//  Bóveda de cañón: arranque/muros 5.00 m, cumbrera 10.00 m, claro interior 22.96.
//  Testera SUR (frente): 2 portones de herrería de 5.00 m + oficina/½ baño al centro.
//  Patio de maniobras al sur + caseta de vigilancia (lote total ~60 m).
// =============================================================================

// ----------------------------------------------------------------------------
//  Paleta (marca El Tío para acentos UI/markers)
// ----------------------------------------------------------------------------
export const COLORS = {
  brandMaroon: '#8B1A2B',
  brandOrange: '#D4581A',
  brandPeach: '#E8956D',

  roofMetal: '#b4b9bf',
  wallBone: '#ece7df',
  wallBase: '#5c5e63',
  steel: '#3a3a40',
  concrete: '#9d9c97',
  joint: '#7c7b77',
  flowYellow: '#E8B100',
  rackOrange: '#E0571C',

  truckBody: '#f3f4f6',
  truckChrome: '#cfd3d8',
  truckGlass: '#1b2733',
  tire: '#15151a',
} as const

// ----------------------------------------------------------------------------
//  Planta / huella de la NAVE
// ----------------------------------------------------------------------------
export const PLANT = {
  minX: -12.825,
  maxX: 12.825,
  minZ: -15.15,
  maxZ: 15.15,
  halfX: 12.825,
  halfZ: 15.15,
  width: 25.65, // X (ejes A-C)
  depth: 30.3, // Z (ejes 1-6)
} as const

// ----------------------------------------------------------------------------
//  Bóveda de cañón
//    Arranque (muros) a 5.00 m, cumbrera a 10.00 m.
//    Arco que arranca en x=±12.825 (y=5.00) y culmina en x=0 (y=10.00).
//    R = (a²+h²)/(2h) con a=12.825, h=5.00 → R≈18.948 ; centro y≈−8.948.
// ----------------------------------------------------------------------------
export const ROOF = {
  radius: 18.948,
  centerY: -8.948,
  ribEvery: 6.06, // costillas en los ejes (claros de 6.06 m)
  shellThickness: 0.1,
} as const

export function arcY(x: number): number {
  return ROOF.centerY + Math.sqrt(ROOF.radius * ROOF.radius - x * x)
}

export const EAVE = arcY(PLANT.halfX) // ≈ 5.00 — arranque / altura de muros
export const RIDGE = arcY(0) // ≈ 10.00 — cumbrera

// ----------------------------------------------------------------------------
//  Muros
// ----------------------------------------------------------------------------
export const WALL = {
  perimeterThickness: 0.3,
  partitionThickness: 0.15,
  roomHeight: 2.8, // oficina / baño
  baseHeight: 1.2, // zócalo
} as const

// ----------------------------------------------------------------------------
//  Aberturas en la testera SUR (frente), Z = +15.15
//  2 portones de herrería de 5.00 m, flanqueando el bloque de oficina (8.67 m).
//    margen 5.30 | portón 5.00 | central 8.67 | portón 5.00 | margen 1.68
// ----------------------------------------------------------------------------
export const OPENINGS = {
  portonL: { x1: -7.525, x2: -2.525, height: 4.5 }, // portón izquierdo
  portonR: { x1: 6.145, x2: 11.145, height: 4.5 }, // portón derecho (rampa)
} as const

// ----------------------------------------------------------------------------
//  Espacios
// ----------------------------------------------------------------------------
export interface RoomDef {
  id: string
  label: string
  x1: number
  x2: number
  z1: number
  z2: number
  height: number
  ceiling: boolean
  tint?: string
}

export const ROOMS: RoomDef[] = [
  {
    id: 'bodega',
    label: 'BODEGA',
    x1: -12.825,
    x2: 12.825,
    z1: -15.15,
    z2: 15.15,
    height: EAVE,
    ceiling: false,
  },
  {
    id: 'oficina',
    label: 'OFICINA',
    x1: -0.7,
    x2: 4.8,
    z1: 9.0,
    z2: 13.8,
    height: WALL.roomHeight,
    ceiling: true,
    tint: COLORS.brandMaroon,
  },
  {
    id: 'banoOf',
    label: 'BAÑO',
    x1: -0.7,
    x2: 1.8,
    z1: 13.8,
    z2: 15.15,
    height: WALL.roomHeight,
    ceiling: true,
  },
]

// ----------------------------------------------------------------------------
//  Muros (alineados a eje, con puerta opcional)
// ----------------------------------------------------------------------------
export interface Wall {
  id: string
  x1: number
  z1: number
  x2: number
  z2: number
  height: number
  thickness: number
  door?: { at: number; width: number; height: number }
}

// Muros perimetrales laterales (este / oeste), rectos hasta el arranque (5.00).
export const SIDE_WALLS: Wall[] = [
  {
    id: 'west',
    x1: PLANT.minX,
    z1: PLANT.minZ,
    x2: PLANT.minX,
    z2: PLANT.maxZ,
    height: EAVE,
    thickness: WALL.perimeterThickness,
  },
  {
    id: 'east',
    x1: PLANT.maxX,
    z1: PLANT.minZ,
    x2: PLANT.maxX,
    z2: PLANT.maxZ,
    height: EAVE,
    thickness: WALL.perimeterThickness,
  },
]

// Particiones interiores: oficina + ½ baño (bloque central-sur).
export const PARTITIONS: Wall[] = [
  // oficina — muro norte (mira a la bodega) con puerta
  {
    id: 'of-N',
    x1: -0.7,
    z1: 9.0,
    x2: 4.8,
    z2: 9.0,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
    door: { at: 2.05, width: 1.1, height: 2.15 },
  },
  // oficina — muro oeste (envuelve oficina + baño)
  {
    id: 'of-W',
    x1: -0.7,
    z1: 9.0,
    x2: -0.7,
    z2: 15.15,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
  },
  // oficina — muro este
  {
    id: 'of-E',
    x1: 4.8,
    z1: 9.0,
    x2: 4.8,
    z2: 13.8,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
  },
  // oficina — muro sur (tramo este, el oeste lo cierra el baño)
  {
    id: 'of-S',
    x1: 1.8,
    z1: 13.8,
    x2: 4.8,
    z2: 13.8,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
  },
  // ½ baño — muro este
  {
    id: 'ba-E',
    x1: 1.8,
    z1: 13.8,
    x2: 1.8,
    z2: 15.15,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
  },
  // ½ baño — muro norte (mira a la oficina) con puerta
  {
    id: 'ba-N',
    x1: -0.7,
    z1: 13.8,
    x2: 1.8,
    z2: 13.8,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
    door: { at: 0.55, width: 0.8, height: 2.1 },
  },
]

// ----------------------------------------------------------------------------
//  Camión — International eMV, arrimado de reversa al PORTÓN DERECHO (rampa).
//  Coords locales: apunta a +Z (trasera de caja en z=0, frente en +z).
// ----------------------------------------------------------------------------
const PORTON_R_CX = (OPENINGS.portonR.x1 + OPENINGS.portonR.x2) / 2 // 8.645

export const TRUCK = {
  place: { x: PORTON_R_CX, z: PLANT.maxZ + 0.2, rotY: 0 },

  deck: 1.25,
  box: { len: 7.92, width: 2.59, height: 2.55 },
  gapBoxCab: 0.12,
  cab: { len: 1.6, width: 2.42, base: 0.95, top: 2.62 },
  hood: { len: 1.4, width: 2.3, base: 0.95, top: 1.7 },
  bumper: { height: 0.45, depth: 0.25 },

  tire: { radius: 0.525, width: 0.34 },
  axle: { rearZ: 2.4, frontZ: 9.0, trackHalf: 1.0, dualGap: 0.38 },

  ramp: { width: 2.0, runZ: 4.2, fromDeck: 1.25 },
} as const

export const TRUCK_LEN = TRUCK.box.len + TRUCK.gapBoxCab + TRUCK.cab.len + TRUCK.hood.len
export const boxTop = TRUCK.deck + TRUCK.box.height

// ----------------------------------------------------------------------------
//  Patio de maniobras (al SUR de la fachada) + lote
// ----------------------------------------------------------------------------
export const YARD = {
  front: 26, // profundidad del patio hacia el sur
  width: 28.5, // ancho del lote en X
  groundExtra: 50,
} as const

// ----------------------------------------------------------------------------
//  Flujo de descarga: del portón derecho hacia el fondo de la bodega.
// ----------------------------------------------------------------------------
export const FLOW = {
  laneX: PORTON_R_CX,
  fromZ: 13.6,
  toZ: -13,
  arrows: 7,
} as const

// Cajón exclusivo del tortón (rampa de descarga), en el portón derecho.
export const TRUCK_BAY = {
  x1: OPENINGS.portonR.x1,
  x2: OPENINGS.portonR.x2,
  zStart: PLANT.maxZ,
  length: 12,
} as const
export const TRUCK_BAY_ZEND = TRUCK_BAY.zStart - TRUCK_BAY.length

// ----------------------------------------------------------------------------
//  Tipos / helpers de colisión y render de muros
// ----------------------------------------------------------------------------
export interface Box {
  cx: number
  cy: number
  cz: number
  sx: number
  sy: number
  sz: number
}

export interface AABB {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

function isAlongX(w: Wall): boolean {
  return Math.abs(w.z1 - w.z2) < 1e-6
}

export function wallBoxes(w: Wall): { render: Box[]; collide: Box[] } {
  const render: Box[] = []
  const collide: Box[] = []
  const t = w.thickness
  const h = w.height

  if (isAlongX(w)) {
    const z = w.z1
    const a = Math.min(w.x1, w.x2)
    const b = Math.max(w.x1, w.x2)
    if (!w.door) {
      const box: Box = { cx: (a + b) / 2, cy: h / 2, cz: z, sx: b - a, sy: h, sz: t }
      render.push(box)
      collide.push(box)
    } else {
      const d = w.door
      const l1 = a
      const l2 = d.at - d.width / 2
      const r1 = d.at + d.width / 2
      const r2 = b
      if (l2 > l1) {
        const box: Box = { cx: (l1 + l2) / 2, cy: h / 2, cz: z, sx: l2 - l1, sy: h, sz: t }
        render.push(box)
        collide.push(box)
      }
      if (r2 > r1) {
        const box: Box = { cx: (r1 + r2) / 2, cy: h / 2, cz: z, sx: r2 - r1, sy: h, sz: t }
        render.push(box)
        collide.push(box)
      }
      render.push({ cx: d.at, cy: (d.height + h) / 2, cz: z, sx: d.width, sy: h - d.height, sz: t })
    }
  } else {
    const x = w.x1
    const a = Math.min(w.z1, w.z2)
    const b = Math.max(w.z1, w.z2)
    if (!w.door) {
      const box: Box = { cx: x, cy: h / 2, cz: (a + b) / 2, sx: t, sy: h, sz: b - a }
      render.push(box)
      collide.push(box)
    } else {
      const d = w.door
      const l1 = a
      const l2 = d.at - d.width / 2
      const r1 = d.at + d.width / 2
      const r2 = b
      if (l2 > l1) {
        const box: Box = { cx: x, cy: h / 2, cz: (l1 + l2) / 2, sx: t, sy: h, sz: l2 - l1 }
        render.push(box)
        collide.push(box)
      }
      if (r2 > r1) {
        const box: Box = { cx: x, cy: h / 2, cz: (r1 + r2) / 2, sx: t, sy: h, sz: r2 - r1 }
        render.push(box)
        collide.push(box)
      }
      render.push({ cx: x, cy: (d.height + h) / 2, cz: d.at, sx: t, sy: h - d.height, sz: d.width })
    }
  }
  return { render, collide }
}

export function boxToAABB(b: Box, pad = 0): AABB {
  return {
    minX: b.cx - b.sx / 2 - pad,
    maxX: b.cx + b.sx / 2 + pad,
    minZ: b.cz - b.sz / 2 - pad,
    maxZ: b.cz + b.sz / 2 + pad,
  }
}

/** Segmentos sólidos de la testera SUR dejando libres los 2 portones. */
export function southWallColliders(): Box[] {
  const z = PLANT.maxZ
  const h = EAVE
  const t = WALL.perimeterThickness
  const spans: [number, number][] = [
    [PLANT.minX, OPENINGS.portonL.x1],
    [OPENINGS.portonL.x2, OPENINGS.portonR.x1],
    [OPENINGS.portonR.x2, PLANT.maxX],
  ]
  return spans
    .filter(([a, b]) => b - a > 0.01)
    .map(([a, b]) => ({ cx: (a + b) / 2, cy: h / 2, cz: z, sx: b - a, sy: h, sz: t }))
}

export function buildColliders(): AABB[] {
  const boxes: Box[] = []
  for (const w of SIDE_WALLS) boxes.push(...wallBoxes(w).collide)
  for (const w of PARTITIONS) boxes.push(...wallBoxes(w).collide)
  boxes.push(...southWallColliders())
  boxes.push({
    cx: 0,
    cy: EAVE / 2,
    cz: PLANT.minZ,
    sx: PLANT.width,
    sy: EAVE,
    sz: WALL.perimeterThickness,
  })
  return boxes.map((b) => boxToAABB(b))
}

// ----------------------------------------------------------------------------
//  Áreas (m²) por zona
// ----------------------------------------------------------------------------
export function roomArea(r: RoomDef): number {
  return Math.abs(r.x2 - r.x1) * Math.abs(r.z2 - r.z1)
}

export const AREAS = ROOMS.map((r) => ({ id: r.id, label: r.label, area: roomArea(r) }))

export const FOOTPRINT_AREA = PLANT.width * PLANT.depth // ≈ 777 m²
