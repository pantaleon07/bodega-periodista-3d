import * as THREE from 'three'
import { COLORS, PLANT, FLOW } from '../constants/dims'

// =============================================================================
//  Texturas procedurales por canvas — 100% confiables (sin descargas), con las
//  juntas y líneas EXACTAS del plano. Se memorizan a nivel de módulo.
// =============================================================================

let _floor: THREE.Texture | null = null
let _floorRough: THREE.Texture | null = null
let _metalNormal: THREE.Texture | null = null
let _blockNormal: THREE.Texture | null = null
let _hatch: THREE.Texture | null = null

/** Ruido sutil tipo concreto sobre un canvas ya pintado. */
function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, n: number, alpha: number) {
  for (let i = 0; i < n; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1
    const y = (Math.sin(i * 78.233) * 12543.135) % 1
    const px = Math.abs(x) * w
    const py = Math.abs(y) * h
    const g = 120 + ((i * 53) % 90)
    ctx.fillStyle = `rgba(${g},${g},${g - 4},${alpha})`
    const r = 0.5 + ((i * 7) % 3) * 0.6
    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

/**
 * Piso de concreto: color base + juntas de control cada 2.5 m + líneas amarillas
 * de circulación a lo largo del carril de descarga (pasillo).
 * Un texel del canvas = (PLANT.width / 2048) metros aprox.
 */
export function floorTextures(): { map: THREE.Texture; rough: THREE.Texture } {
  if (_floor && _floorRough) return { map: _floor, rough: _floorRough }

  const M = 2048 // px para 20 m de ancho de planta → ~102 px/m
  const span = PLANT.width // 20 m mapeados a M px (la cuadrícula la repetimos 1:1)
  const pxPerM = M / span
  const cv = document.createElement('canvas')
  cv.width = cv.height = M
  const ctx = cv.getContext('2d')!

  // base
  ctx.fillStyle = COLORS.concrete
  ctx.fillRect(0, 0, M, M)
  // variación suave de tono (manchas grandes)
  for (let i = 0; i < 40; i++) {
    const gx = (Math.abs(Math.sin(i * 1.7)) * M) | 0
    const gy = (Math.abs(Math.cos(i * 2.3)) * M) | 0
    const rad = 120 + ((i * 37) % 220)
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad)
    const d = i % 2 === 0 ? 12 : -10
    g.addColorStop(0, `rgba(${157 + d},${156 + d},${151 + d},0.18)`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, M, M)
  }
  speckle(ctx, M, M, 9000, 0.05)

  // juntas de control cada 2.5 m
  const step = 2.5 * pxPerM
  ctx.strokeStyle = COLORS.joint
  ctx.lineWidth = 2.2
  for (let x = step; x < M; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, M)
    ctx.stroke()
  }
  for (let y = step; y < M; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(M, y)
    ctx.stroke()
  }

  // Líneas amarillas de circulación: un carril a lo largo del eje de descarga.
  // Mundo X∈[-10,10] → px [0,M]. Carril en FLOW.laneX ± 1.2 m.
  const worldToPx = (x: number) => ((x - PLANT.minX) / PLANT.width) * M
  ctx.strokeStyle = COLORS.flowYellow
  ctx.lineWidth = 6
  ctx.setLineDash([])
  for (const off of [-1.25, 1.25]) {
    const px = worldToPx(FLOW.laneX + off)
    ctx.beginPath()
    ctx.moveTo(px, 0)
    ctx.lineTo(px, M)
    ctx.stroke()
  }

  const map = new THREE.CanvasTexture(cv)
  map.colorSpace = THREE.SRGBColorSpace
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.anisotropy = 8
  // 1:1 con la planta (no repetir) — el plano del piso ya mide 20×20
  map.repeat.set(1, 1)

  // rugosidad: variación leve (más oscuro = más liso en las líneas)
  const rcv = document.createElement('canvas')
  rcv.width = rcv.height = 512
  const rctx = rcv.getContext('2d')!
  rctx.fillStyle = '#b9b9b9'
  rctx.fillRect(0, 0, 512, 512)
  speckle(rctx, 512, 512, 4000, 0.08)
  const rough = new THREE.CanvasTexture(rcv)
  rough.wrapS = rough.wrapT = THREE.RepeatWrapping
  rough.repeat.set(6, 6)

  _floor = map
  _floorRough = rough
  return { map, rough }
}

/** Normal map de lámina engargolada (franjas verticales) para el techo metálico. */
export function metalNormal(): THREE.Texture {
  if (_metalNormal) return _metalNormal
  const W = 256
  const H = 16
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')!
  // normal base (plano) = (128,128,255)
  for (let x = 0; x < W; x++) {
    // onda senoidal → pendiente lateral en X (engargolado cada ~12 px)
    const s = Math.sin((x / W) * Math.PI * 2 * 16)
    const nx = Math.round(128 + s * 70)
    ctx.fillStyle = `rgb(${nx},128,235)`
    ctx.fillRect(x, 0, 1, H)
  }
  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(40, 60)
  _metalNormal = tex
  return tex
}

/**
 * Rayado de zona exclusiva (estacionamiento reservado): borde + líneas amarillas
 * cruzadas en diagonal sobre fondo transparente. Aspecto ≈ ancho/largo del cajón.
 */
export function hatchTexture(): THREE.Texture {
  if (_hatch) return _hatch
  const W = 300
  const H = 725 // ≈ 4.55 : 11
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, W, H)

  ctx.strokeStyle = '#E8B100'
  ctx.lineCap = 'round'

  // diagonales en UNA sola dirección (paralelas)
  ctx.lineWidth = 8
  const step = 52
  for (let i = -H; i < W + H; i += step) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + H, H)
    ctx.stroke()
  }
  // borde
  ctx.lineWidth = 13
  ctx.strokeRect(7, 7, W - 14, H - 14)

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  _hatch = tex
  return tex
}

/** Normal map sutil de block para los muros. */
export function blockNormal(): THREE.Texture {
  if (_blockNormal) return _blockNormal
  const W = 256
  const H = 256
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = 'rgb(128,128,255)'
  ctx.fillRect(0, 0, W, H)
  // juntas horizontales (hiladas cada 32 px) + verticales alternadas
  ctx.strokeStyle = 'rgb(110,110,210)'
  ctx.lineWidth = 2
  const rows = 8
  const rh = H / rows
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath()
    ctx.moveTo(0, r * rh)
    ctx.lineTo(W, r * rh)
    ctx.stroke()
    const offset = r % 2 === 0 ? 0 : W / 8
    for (let c = 0; c < 4; c++) {
      const x = (c * W) / 4 + offset
      ctx.beginPath()
      ctx.moveTo(x, r * rh)
      ctx.lineTo(x, (r + 1) * rh)
      ctx.stroke()
    }
  }
  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(8, 4)
  _blockNormal = tex
  return tex
}
