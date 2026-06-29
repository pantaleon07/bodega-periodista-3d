import { useMemo } from 'react'
import * as THREE from 'three'
import { TRUCK_BAY, TRUCK_BAY_ZEND } from '../constants/dims'
import { hatchTexture } from '../lib/textures'

/**
 * Cajón exclusivo del tortón (11 m) marcado con líneas amarillas cruzadas,
 * estilo estacionamiento reservado. Alineado al portón / pasillo de acceso.
 */
export function TruckBay() {
  const w = TRUCK_BAY.x2 - TRUCK_BAY.x1
  const cx = (TRUCK_BAY.x1 + TRUCK_BAY.x2) / 2
  const cz = (TRUCK_BAY.zStart + TRUCK_BAY_ZEND) / 2

  const mat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      map: hatchTexture(),
      transparent: true,
      toneMapped: false,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    })
    return m
  }, [])

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[cx, 0.016, cz]}
      material={mat}
      renderOrder={2}
    >
      <planeGeometry args={[w, TRUCK_BAY.length]} />
    </mesh>
  )
}
