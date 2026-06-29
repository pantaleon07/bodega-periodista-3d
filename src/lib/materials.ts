import * as THREE from 'three'
import { COLORS } from '../constants/dims'
import { floorTextures, metalNormal, blockNormal } from './textures'

// =============================================================================
//  Materiales singleton (memorizados) — reutilizados por toda la escena.
//  Los reflejos los aporta el environment (HDRI) de drei.
// =============================================================================

let _cache: Record<string, THREE.Material> = {}

function memo<T extends THREE.Material>(key: string, make: () => T): T {
  if (!_cache[key]) _cache[key] = make()
  return _cache[key] as T
}

export const mat = {
  wall: () =>
    memo('wall', () => {
      const m = new THREE.MeshStandardMaterial({
        color: COLORS.wallBone,
        roughness: 0.93,
        metalness: 0,
      })
      const n = blockNormal()
      m.normalMap = n
      m.normalScale = new THREE.Vector2(0.25, 0.25)
      return m
    }),

  base: () =>
    memo(
      'base',
      () =>
        new THREE.MeshStandardMaterial({
          color: COLORS.wallBase,
          roughness: 0.85,
          metalness: 0.05,
        }),
    ),

  floor: () =>
    memo('floor', () => {
      const { map, rough } = floorTextures()
      return new THREE.MeshStandardMaterial({
        map,
        roughnessMap: rough,
        roughness: 0.96,
        metalness: 0.02,
        envMapIntensity: 0.35,
      })
    }),

  steel: () =>
    memo(
      'steel',
      () =>
        new THREE.MeshStandardMaterial({
          color: COLORS.steel,
          metalness: 0.85,
          roughness: 0.45,
        }),
    ),

  roof: () =>
    memo('roof', () => {
      const m = new THREE.MeshStandardMaterial({
        color: COLORS.roofMetal,
        metalness: 0.45,
        roughness: 0.5,
        side: THREE.DoubleSide,
        envMapIntensity: 0.9,
      })
      m.normalMap = metalNormal()
      m.normalScale = new THREE.Vector2(0.4, 0.4)
      return m
    }),

  roofInner: () =>
    memo(
      'roofInner',
      () =>
        new THREE.MeshStandardMaterial({
          color: '#cfd2d6',
          metalness: 0.3,
          roughness: 0.6,
          side: THREE.BackSide,
        }),
    ),

  asphalt: () =>
    memo(
      'asphalt',
      () =>
        new THREE.MeshStandardMaterial({
          color: '#3c3d41',
          roughness: 0.95,
          metalness: 0,
        }),
    ),

  ground: () =>
    memo(
      'ground',
      () =>
        new THREE.MeshStandardMaterial({
          color: '#6f6a5e',
          roughness: 1,
          metalness: 0,
        }),
    ),

  ceiling: () =>
    memo(
      'ceiling',
      () =>
        new THREE.MeshStandardMaterial({
          color: '#e7e3da',
          roughness: 0.95,
          metalness: 0,
        }),
    ),

  frame: () =>
    memo(
      'frame',
      () =>
        new THREE.MeshStandardMaterial({
          color: COLORS.brandOrange,
          metalness: 0.4,
          roughness: 0.5,
        }),
    ),

  curtain: () =>
    memo(
      'curtain',
      () =>
        new THREE.MeshStandardMaterial({
          color: '#aeb3b9',
          metalness: 0.55,
          roughness: 0.55,
        }),
    ),
}

/** Para HMR / limpieza manual si hiciera falta. */
export function disposeMaterials() {
  for (const k of Object.keys(_cache)) _cache[k].dispose()
  _cache = {}
}
