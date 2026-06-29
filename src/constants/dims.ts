// =============================================================================
//  FUENTE ÚNICA DE VERDAD  —  Bodega Col. Periodista, 400 m² (Oaxaca)
//  Todas las medidas en METROS. Nada de geometría se hardcodea en componentes:
//  se deriva de aquí.
//
//  Sistema de coordenadas (ver §2 del brief):
//    X = este(+)  / oeste(−)
//    Z = sur(+, calle/fachada)  / norte(−, fondo)
//    Y = altura
//  Origen en el CENTRO de la planta. Huella 20×20 → X∈[-10,10], Z∈[-10,10].
//  Piso a nivel de calle (sin andén elevado).
// =============================================================================

// ----------------------------------------------------------------------------
//  Paleta
// ----------------------------------------------------------------------------
export const COLORS = {
  // Marca El Tío (acentos UI / markers)
  brandMaroon: '#8B1A2B',
  brandOrange: '#D4581A',
  brandPeach: '#E8956D',

  // Materiales de obra
  roofMetal: '#b4b9bf', // lámina galvanizada / aluzinc
  wallBone: '#ece7df', // block pintado hueso
  wallBase: '#5c5e63', // zócalo gris oxford (1.2 m)
  steel: '#3a3a40', // estructura / costillas
  concrete: '#9d9c97', // firme de concreto
  joint: '#7c7b77', // juntas del piso
  flowYellow: '#E8B100', // líneas amarillas de circulación
  rackOrange: '#E0571C', // anaqueles

  truckBody: '#f3f4f6', // blanco hueso del camión
  truckChrome: '#cfd3d8',
  truckGlass: '#1b2733',
  tire: '#15151a',
} as const

// ----------------------------------------------------------------------------
//  Planta / huella
// ----------------------------------------------------------------------------
export const PLANT = {
  minX: -10,
  maxX: 10,
  minZ: -10,
  maxZ: 10,
  halfX: 10,
  halfZ: 10,
  width: 20, // X
  depth: 20, // Z
} as const

// ----------------------------------------------------------------------------
//  Bóveda de cañón (lámina autoportante curva)
//    Muros laterales rectos hasta el alero (3.4984), arco hasta el caballete.
//    Perfil:  y(x) = centerY + sqrt(R² − x²)   con R=14.5, centerY=−7.0016
//      x=0   → 7.4984 (caballete / cumbrera)
//      x=±10 → 3.4984 (alero)
// ----------------------------------------------------------------------------
export const ROOF = {
  radius: 14.5,
  centerY: -7.0016,
  ribEvery: 3, // costillas cada ~3 m a lo largo de Z
  shellThickness: 0.1,
} as const

export function arcY(x: number): number {
  return ROOF.centerY + Math.sqrt(ROOF.radius * ROOF.radius - x * x)
}

export const EAVE = arcY(PLANT.halfX) // 3.4984 — altura de muros laterales
export const RIDGE = arcY(0) // 7.4984 — caballete

// ----------------------------------------------------------------------------
//  Muros
// ----------------------------------------------------------------------------
export const WALL = {
  perimeterThickness: 0.25,
  partitionThickness: 0.15,
  roomHeight: 3.2, // muros de cuartos interiores
  baseHeight: 1.2, // zócalo gris oxford
} as const

// ----------------------------------------------------------------------------
//  Aberturas del muro sur (fachada / calle), Z = +10
// ----------------------------------------------------------------------------
export const OPENINGS = {
  // Portón principal de descarga
  porton: { x1: -3.18, x2: 1.37, height: 4.5 }, // 4.55 m de ancho × 4.5 alto
  // Cortina del local comercial
  cortina: { x1: -9.85, x2: -7.85, height: 2.43 }, // 2.0 m × 2.43
} as const

// ----------------------------------------------------------------------------
//  Espacios (cuartos). Cada uno: rectángulo en planta + alto + etiqueta.
//  Las paredes se generan en PARTITIONS (no aquí) para no duplicar muros.
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
  /** etiqueta flotante (centro, altura) */
  tint?: string
}

export const ROOMS: RoomDef[] = [
  {
    id: 'bodega',
    label: 'BODEGA MAYOR',
    x1: -10,
    x2: 10,
    z1: -10,
    z2: 0,
    height: EAVE,
    ceiling: false,
  },
  {
    id: 'almacen',
    label: 'ALMACÉN',
    x1: -10,
    x2: -5.95,
    z1: 0.15,
    z2: 4.1,
    height: WALL.roomHeight,
    ceiling: true,
    tint: COLORS.brandMaroon,
  },
  {
    id: 'local',
    label: 'LOCAL COMERCIAL',
    x1: -10,
    x2: -3.18,
    z1: 4.1,
    z2: 10,
    height: WALL.roomHeight,
    ceiling: true,
  },
  {
    id: 'banoLocal',
    label: 'BAÑO',
    x1: -6.6,
    x2: -3.9,
    z1: 8.4,
    z2: 10,
    height: WALL.roomHeight,
    ceiling: true,
  },
  {
    id: 'oficinas',
    label: 'OFICINAS',
    x1: 1.37,
    x2: 10,
    z1: 4.1,
    z2: 10,
    height: WALL.roomHeight,
    ceiling: true,
  },
  {
    id: 'banoOf',
    label: 'BAÑO',
    x1: 7.45,
    x2: 10,
    z1: 5.75,
    z2: 10,
    height: WALL.roomHeight,
    ceiling: true,
  },
  {
    id: 'pasillo',
    label: 'ACCESO',
    x1: -3.18,
    x2: 1.37,
    z1: 0,
    z2: 10,
    height: EAVE,
    ceiling: false,
  },
]

// ----------------------------------------------------------------------------
//  Muros: un muro es siempre alineado a eje (X constante o Z constante).
//  Puede llevar UNA puerta (hueco). 'at' = centro del hueco sobre el eje que
//  varía;  width/doorHeight definen el vano.
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

// Muros perimetrales laterales (este / oeste) — rectos hasta el alero.
export const SIDE_WALLS: Wall[] = [
  {
    id: 'west',
    x1: -10,
    z1: -10,
    x2: -10,
    z2: 10,
    height: EAVE,
    thickness: WALL.perimeterThickness,
  },
  {
    id: 'east',
    x1: 10,
    z1: -10,
    x2: 10,
    z2: 10,
    height: EAVE,
    thickness: WALL.perimeterThickness,
  },
]

// Particiones interiores (block ~3.2 m) con sus puertas.
export const PARTITIONS: Wall[] = [
  // --- Almacén cerrado (candidato a farmacia) ---
  // muro sur (mira a la bodega mayor) con puerta de acceso
  {
    id: 'almacen-S',
    x1: -10,
    z1: 0.15,
    x2: -5.95,
    z2: 0.15,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
    door: { at: -7.4, width: 1.1, height: 2.15 },
  },
  // muro este
  {
    id: 'almacen-E',
    x1: -5.95,
    z1: 0.15,
    x2: -5.95,
    z2: 4.1,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
  },
  // --- Local comercial ---
  // muro norte (compartido con almacén en parte) Z=4.10
  {
    id: 'local-N',
    x1: -10,
    z1: 4.1,
    x2: -3.18,
    z2: 4.1,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
  },
  // muro este (mira al pasillo) X=-3.18 con puerta
  {
    id: 'local-E',
    x1: -3.18,
    z1: 4.1,
    x2: -3.18,
    z2: 10,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
    door: { at: 6.0, width: 1.1, height: 2.15 },
  },
  // --- Baño del local ---
  {
    id: 'banoLocal-W',
    x1: -6.6,
    z1: 8.4,
    x2: -6.6,
    z2: 10,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
  },
  {
    id: 'banoLocal-E',
    x1: -3.9,
    z1: 8.4,
    x2: -3.9,
    z2: 10,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
  },
  {
    id: 'banoLocal-N',
    x1: -6.6,
    z1: 8.4,
    x2: -3.9,
    z2: 8.4,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
    door: { at: -5.25, width: 0.8, height: 2.1 },
  },
  // --- Oficinas ---
  // muro oeste (mira al pasillo) X=1.37 con puerta
  {
    id: 'oficinas-W',
    x1: 1.37,
    z1: 4.1,
    x2: 1.37,
    z2: 10,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
    door: { at: 6.0, width: 1.1, height: 2.15 },
  },
  // muro sur Z=4.10
  {
    id: 'oficinas-S',
    x1: 1.37,
    z1: 4.1,
    x2: 10,
    z2: 4.1,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
  },
  // --- Baño de oficinas ---
  {
    id: 'banoOf-W',
    x1: 7.45,
    z1: 5.75,
    x2: 7.45,
    z2: 10,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
  },
  {
    id: 'banoOf-S',
    x1: 7.45,
    z1: 5.75,
    x2: 10,
    z2: 5.75,
    height: WALL.roomHeight,
    thickness: WALL.partitionThickness,
    door: { at: 8.7, width: 0.8, height: 2.1 },
  },
]

// ----------------------------------------------------------------------------
//  Camión — International MV (convencional, caja seca ~26'). Coordenadas
//  LOCALES del camión: apunta hacia +Z (trasera de caja en z=0, frente en +z).
//  Se coloca de reversa al portón: trasera en world Z≈+10.2, centrado X≈-0.9.
// ----------------------------------------------------------------------------
export const TRUCK = {
  // colocación en el mundo (origen local = cara trasera de la caja)
  place: { x: -0.9, z: 10.2, rotY: 0 },

  deck: 1.25, // altura del piso de caja sobre el suelo

  box: { len: 7.92, width: 2.59, height: 2.55 }, // caja seca 26'
  gapBoxCab: 0.12,
  cab: { len: 1.6, width: 2.42, base: 0.95, top: 2.62 }, // cabina
  hood: { len: 1.4, width: 2.3, base: 0.95, top: 1.7 }, // cofre / nariz
  bumper: { height: 0.45, depth: 0.25 },

  tire: { radius: 0.525, width: 0.34 },
  axle: {
    rearZ: 2.4, // centro eje trasero (dual) en z local
    frontZ: 9.0, // centro eje delantero en z local
    trackHalf: 1.0, // separación de ruedas respecto al centro
    dualGap: 0.38, // separación entre llantas duales traseras
  },

  // Rampa niveladora dentro del portón (puente deck → piso a nivel)
  ramp: { width: 2.0, runZ: 4.2, fromDeck: 1.25 },
} as const

// total aproximado de largo (para validar maniobra)
export const TRUCK_LEN =
  TRUCK.box.len + TRUCK.gapBoxCab + TRUCK.cab.len + TRUCK.hood.len

// altura del techo de la caja sobre el suelo (deck + alto de caja)
export const boxTop = TRUCK.deck + TRUCK.box.height

// ----------------------------------------------------------------------------
//  Patio / calle (maniobra de reversa). Al SUR de la fachada (Z > 10).
// ----------------------------------------------------------------------------
export const YARD = {
  front: 11, // profundidad hacia el sur desde la fachada
  width: 22, // ancho del patio en X
  groundExtra: 40, // terreno extra alrededor
} as const

// ----------------------------------------------------------------------------
//  Flujo de descarga: del portón (sur) hacia la bodega mayor (norte).
//  Flechas naranjas sobre el pasillo (X∈[-3.18,1.37]).
// ----------------------------------------------------------------------------
// Las flechas viven SOLO dentro del cajón del tortón (no se salen al resto de
// la bodega): de la entrada del portón al extremo norte del cajón.
export const FLOW = {
  laneX: -0.9, // centro del carril (alineado al portón / camión)
  fromZ: 9.2, // arranca pasada la entrada (dentro del cajón)
  toZ: -0.6, // termina al borde norte del cajón del tortón (≈ -1)
  arrows: 5,
} as const

// ----------------------------------------------------------------------------
//  Zona exclusiva del tortón (estacionamiento reservado) — 11 m de largo,
//  rayado amarillo cruzado, alineada al portón / pasillo de acceso.
//  Va del umbral del portón (Z=10) hacia el norte 11 m → Z=-1.
// ----------------------------------------------------------------------------
export const TRUCK_BAY = {
  x1: -3.18,
  x2: 1.37,
  zStart: PLANT.maxZ, // 10 (portón)
  length: 11,
} as const
export const TRUCK_BAY_ZEND = TRUCK_BAY.zStart - TRUCK_BAY.length // -1

// ----------------------------------------------------------------------------
//  Tipos / helpers de colisión y render de muros
// ----------------------------------------------------------------------------
export interface Box {
  /** centro */
  cx: number
  cy: number
  cz: number
  /** tamaño */
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

/** ¿el muro es de Z constante (varía X)?  si no, es de X constante (varía Z) */
function isAlongX(w: Wall): boolean {
  return Math.abs(w.z1 - w.z2) < 1e-6
}

/**
 * Expande un muro a cajas para RENDER (incluye dintel sobre la puerta) y a
 * cajas SÓLIDAS para colisión (excluye dintel; deja pasar por el vano).
 */
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
      // dintel (solo render)
      render.push({
        cx: d.at,
        cy: (d.height + h) / 2,
        cz: z,
        sx: d.width,
        sy: h - d.height,
        sz: t,
      })
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
      render.push({
        cx: x,
        cy: (d.height + h) / 2,
        cz: d.at,
        sx: t,
        sy: h - d.height,
        sz: d.width,
      })
    }
  }
  return { render, collide }
}

/** AABB (planta XZ) a partir de una caja, con padding opcional. */
export function boxToAABB(b: Box, pad = 0): AABB {
  return {
    minX: b.cx - b.sx / 2 - pad,
    maxX: b.cx + b.sx / 2 + pad,
    minZ: b.cz - b.sz / 2 - pad,
    maxZ: b.cz + b.sz / 2 + pad,
  }
}

/**
 * Segmentos sólidos del muro SUR (fachada) dejando libres portón y cortina.
 * Se usan para colisión y para el frontón (que se dibuja como shape aparte).
 */
export function southWallColliders(): Box[] {
  const z = PLANT.maxZ
  const h = EAVE
  const t = WALL.perimeterThickness
  // tramos llenos: [-10,-9.85] | [-7.85,-3.18] | [1.37,10]
  const spans: [number, number][] = [
    [PLANT.minX, OPENINGS.cortina.x1],
    [OPENINGS.cortina.x2, OPENINGS.porton.x1],
    [OPENINGS.porton.x2, PLANT.maxX],
  ]
  return spans
    .filter(([a, b]) => b - a > 0.01)
    .map(([a, b]) => ({ cx: (a + b) / 2, cy: h / 2, cz: z, sx: b - a, sy: h, sz: t }))
}

// ----------------------------------------------------------------------------
//  Áreas (m²) por zona — para el panel y las etiquetas.
// ----------------------------------------------------------------------------
export function roomArea(r: RoomDef): number {
  return Math.abs(r.x2 - r.x1) * Math.abs(r.z2 - r.z1)
}

export const AREAS = ROOMS.map((r) => ({ id: r.id, label: r.label, area: roomArea(r) }))

export const FOOTPRINT_AREA = PLANT.width * PLANT.depth // 400 m²

/** Construye todos los AABB sólidos para colisión en primera persona. */
export function buildColliders(): AABB[] {
  const boxes: Box[] = []
  // muros laterales
  for (const w of SIDE_WALLS) boxes.push(...wallBoxes(w).collide)
  // particiones
  for (const w of PARTITIONS) boxes.push(...wallBoxes(w).collide)
  // muro sur (segmentos) + muro norte (lleno)
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
