import * as THREE from 'three'
import { Text, Billboard } from '@react-three/drei'

// =============================================================================
//  Refrigeradores farmacéuticos (cadena de frío 2–8 °C) — puerta de vidrio con
//  glow frío interior. Colocados en el espacio libre junto a los anaqueles.
// =============================================================================

const W = 0.62
const D = 0.65
const H = 1.96

const bodyMat = new THREE.MeshStandardMaterial({ color: '#eef1f4', metalness: 0.4, roughness: 0.4 })
const glassMat = new THREE.MeshStandardMaterial({
  color: '#c8e8f2',
  metalness: 0.1,
  roughness: 0.06,
  transparent: true,
  opacity: 0.4,
})
const glowMat = new THREE.MeshStandardMaterial({
  color: '#d6f3fb',
  emissive: '#6fd2ef',
  emissiveIntensity: 0.7,
  roughness: 0.5,
  toneMapped: false,
})
const shelfMat = new THREE.MeshStandardMaterial({ color: '#d3d9de', metalness: 0.3, roughness: 0.6 })
const chromeMat = new THREE.MeshStandardMaterial({ color: '#cfd3d8', metalness: 0.95, roughness: 0.2 })
const darkMat = new THREE.MeshStandardMaterial({ color: '#22252a', metalness: 0.4, roughness: 0.5 })
const dispMat = new THREE.MeshStandardMaterial({
  color: '#0b2a2e',
  emissive: '#19e0c0',
  emissiveIntensity: 0.9,
  toneMapped: false,
})

function Fridge({ x, z, rotY = 0 }: { x: number; z: number; rotY?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* zócalo */}
      <mesh position={[0, 0.06, 0]} castShadow material={darkMat}>
        <boxGeometry args={[W, 0.12, D]} />
      </mesh>
      {/* cuerpo */}
      <mesh position={[0, 0.12 + (H - 0.12) / 2, 0]} castShadow receiveShadow material={bodyMat}>
        <boxGeometry args={[W, H - 0.12, D]} />
      </mesh>
      {/* glow frío interior (detrás del vidrio) */}
      <mesh position={[0, 1.05, D / 2 - 0.05]} material={glowMat}>
        <boxGeometry args={[W - 0.14, 1.5, 0.02]} />
      </mesh>
      {/* estantes visibles */}
      {[0.6, 1.05, 1.5].map((sy) => (
        <mesh key={sy} position={[0, sy, D / 2 - 0.18]} material={shelfMat}>
          <boxGeometry args={[W - 0.16, 0.03, 0.22]} />
        </mesh>
      ))}
      {/* puerta de vidrio */}
      <mesh position={[0, 1.05, D / 2 + 0.005]} material={glassMat}>
        <boxGeometry args={[W - 0.08, 1.55, 0.03]} />
      </mesh>
      {/* manija */}
      <mesh position={[-(W / 2) + 0.08, 1.05, D / 2 + 0.04]} material={chromeMat}>
        <boxGeometry args={[0.04, 1.0, 0.04]} />
      </mesh>
      {/* panel de control + display */}
      <mesh position={[0, 1.86, D / 2 - 0.01]} material={darkMat}>
        <boxGeometry args={[W - 0.2, 0.12, 0.06]} />
      </mesh>
      <mesh position={[0.06, 1.86, D / 2 + 0.02]} material={dispMat}>
        <boxGeometry args={[0.16, 0.06, 0.02]} />
      </mesh>
    </group>
  )
}

export function Fridges() {
  return (
    <group>
      <Fridge x={0.7} z={-9.5} />
      <Fridge x={1.4} z={-9.5} />
      <Billboard position={[1.05, 2.35, -9.5]}>
        <Text
          fontSize={0.26}
          color="#ffffff"
          outlineWidth={0.02}
          outlineColor="#0c5a63"
          anchorX="center"
          anchorY="middle"
        >
          REFRIG. FARMACIA · 2–8 °C
        </Text>
      </Billboard>
    </group>
  )
}
