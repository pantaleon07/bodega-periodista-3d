import * as THREE from 'three'
import { PLANT, OPENINGS, EAVE, arcY, ROOF } from '../constants/dims'

// =============================================================================
//  Geometría derivada del arco de la bóveda.
// =============================================================================

/** Puntos del perfil del arco en el plano X-Y (de oeste a este). */
export function arcProfile(samples = 96): THREE.Vector2[] {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= samples; i++) {
    const x = PLANT.minX + (PLANT.width * i) / samples
    pts.push(new THREE.Vector2(x, arcY(x)))
  }
  return pts
}

/** Curva 3D del arco (a z=0) para extruir costillas con TubeGeometry. */
export function arcCurve(samples = 64): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= samples; i++) {
    const x = PLANT.minX + (PLANT.width * i) / samples
    pts.push(new THREE.Vector3(x, arcY(x), 0))
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0)
}

/**
 * Cascarón de la bóveda: superficie curva (perfil del arco en X-Y) extruida a
 * lo largo de Z. UV: u = longitud de arco normalizada, v = z normalizada.
 */
export function makeVaultGeometry(nx = 100): THREE.BufferGeometry {
  const profile = arcProfile(nx)
  const zMin = PLANT.minZ
  const zMax = PLANT.maxZ
  const nz = 1 // extrusión recta → 1 segmento basta

  // longitud de arco acumulada para U
  const arcLen: number[] = [0]
  for (let i = 1; i < profile.length; i++) {
    arcLen.push(arcLen[i - 1] + profile[i].distanceTo(profile[i - 1]))
  }
  const totalLen = arcLen[arcLen.length - 1]

  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let zi = 0; zi <= nz; zi++) {
    const z = zMin + ((zMax - zMin) * zi) / nz
    for (let i = 0; i < profile.length; i++) {
      positions.push(profile[i].x, profile[i].y, z)
      uvs.push(arcLen[i] / totalLen, (z - zMin) / (zMax - zMin))
    }
  }

  const cols = profile.length
  for (let zi = 0; zi < nz; zi++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = zi * cols + i
      const b = zi * cols + i + 1
      const c = (zi + 1) * cols + i
      const d = (zi + 1) * cols + i + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/**
 * Frontón (muro de remate norte/sur): contorno del arco relleno hasta el piso.
 * Si withOpenings, recorta portón + cortina (solo aplica al sur).
 */
export function makeFrontonShape(withOpenings: boolean): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(PLANT.minX, 0)
  shape.lineTo(PLANT.minX, EAVE)
  const samples = 96
  for (let i = 0; i <= samples; i++) {
    const x = PLANT.minX + (PLANT.width * i) / samples
    shape.lineTo(x, arcY(x))
  }
  shape.lineTo(PLANT.maxX, 0)
  shape.lineTo(PLANT.minX, 0)

  if (withOpenings) {
    // 2 portones de herrería en la testera sur
    for (const o of [OPENINGS.portonL, OPENINGS.portonR]) {
      const p = new THREE.Path()
      p.moveTo(o.x1, 0)
      p.lineTo(o.x1, o.height)
      p.lineTo(o.x2, o.height)
      p.lineTo(o.x2, 0)
      p.lineTo(o.x1, 0)
      shape.holes.push(p)
    }
  }
  return shape
}

/**
 * Cofre inclinado del camión (estilo International eMV): caja con la cara
 * superior en pendiente, más alta atrás (cabina) y más baja al frente.
 * Geometría centrada en Z; reutiliza la topología/normales de BoxGeometry.
 */
export function makeHood(
  width: number,
  len: number,
  base: number,
  topRear: number,
  topFront: number,
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(width, 1, len, 1, 1, 1)
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const z = pos.getZ(i) // -len/2 (atrás) .. +len/2 (frente)
    if (y > 0) {
      const t = (z + len / 2) / len
      pos.setY(i, topRear + (topFront - topRear) * t)
    } else {
      pos.setY(i, base)
    }
  }
  pos.needsUpdate = true
  g.computeVertexNormals()
  return g
}

/** Altura del arco en el centro (caballete). Reexport por comodidad. */
export const apex = arcY(0)
export const arcRadius = ROOF.radius
