import { useMemo } from 'react'
import * as THREE from 'three'
import { TRUCK, PLANT, COLORS } from '../constants/dims'
import { makeHood } from '../lib/geometry'
import { useView } from '../state/useView'

// Camión convencional medium-duty estilo International eMV: cofre inclinado,
// parrilla con marco cromado, faros barridos, salpicaderas y 4×2 (un eje atrás).

const T = TRUCK
const cabStartZ = T.box.len + T.gapBoxCab
const cabEndZ = cabStartZ + T.cab.len
const hoodEndZ = cabEndZ + T.hood.len
const cabMidZ = (cabStartZ + cabEndZ) / 2
const hoodMidZ = (cabEndZ + hoodEndZ) / 2
const chw = T.cab.width / 2
const HOOD_W = 2.34
const HOOD_REAR = 1.78
const HOOD_FRONT = 1.5

const bodyMat = new THREE.MeshStandardMaterial({ color: COLORS.truckBody, metalness: 0.5, roughness: 0.4 })
const boxMat = new THREE.MeshStandardMaterial({ color: '#e9ebef', metalness: 0.25, roughness: 0.55 })
const chromeMat = new THREE.MeshStandardMaterial({ color: COLORS.truckChrome, metalness: 0.95, roughness: 0.16 })
const glassMat = new THREE.MeshStandardMaterial({
  color: COLORS.truckGlass,
  metalness: 0.3,
  roughness: 0.08,
  transparent: true,
  opacity: 0.8,
})
const tireMat = new THREE.MeshStandardMaterial({ color: COLORS.tire, roughness: 0.85, metalness: 0.1 })
const rimMat = new THREE.MeshStandardMaterial({ color: '#9aa0a8', metalness: 0.9, roughness: 0.3 })
const darkMat = new THREE.MeshStandardMaterial({ color: '#23262b', metalness: 0.45, roughness: 0.5 })
const lightMat = new THREE.MeshStandardMaterial({
  color: '#fff6dc',
  emissive: '#ffe9b0',
  emissiveIntensity: 0.7,
  roughness: 0.25,
})
const amberMat = new THREE.MeshStandardMaterial({
  color: '#ffb24d',
  emissive: '#ff9a1f',
  emissiveIntensity: 0.8,
  roughness: 0.4,
})
const rampMat = new THREE.MeshStandardMaterial({ color: '#52555c', metalness: 0.7, roughness: 0.5 })

function Wheel({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow material={tireMat}>
        <cylinderGeometry args={[T.tire.radius, T.tire.radius, T.tire.width, 24]} />
      </mesh>
      <mesh material={rimMat}>
        <cylinderGeometry args={[T.tire.radius * 0.55, T.tire.radius * 0.55, T.tire.width + 0.02, 16]} />
      </mesh>
    </group>
  )
}

/** Salpicadera redondeada sobre la rueda delantera (arco en el plano Y-Z). */
function Fender({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, T.tire.radius, z]} rotation={[0, Math.PI / 2, 0]} castShadow material={bodyMat}>
      <torusGeometry args={[T.tire.radius + 0.12, 0.13, 10, 20, Math.PI]} />
    </mesh>
  )
}

/** Rampa niveladora en el portón: puente del deck (1.25 m) al piso a nivel. */
function Leveler({ x }: { x: number }) {
  const angle = Math.atan(T.ramp.fromDeck / T.ramp.runZ)
  const L = Math.hypot(T.ramp.runZ, T.ramp.fromDeck)
  const cz = PLANT.maxZ - (L / 2) * Math.cos(angle)
  const cy = T.ramp.fromDeck / 2
  return (
    <group>
      <mesh position={[x, cy, cz]} rotation={[-angle, 0, 0]} castShadow receiveShadow material={rampMat}>
        <boxGeometry args={[T.ramp.width, 0.08, L]} />
      </mesh>
      {[-T.ramp.width / 2, T.ramp.width / 2].map((dx) => (
        <mesh key={dx} position={[x + dx, cy + 0.08, cz]} rotation={[-angle, 0, 0]} material={chromeMat}>
          <boxGeometry args={[0.06, 0.12, L]} />
        </mesh>
      ))}
    </group>
  )
}

function TruckBody({ x }: { x: number }) {
  const hoodGeo = useMemo(() => makeHood(HOOD_W, T.hood.len, T.hood.base, HOOD_REAR, HOOD_FRONT), [])

  return (
    <group position={[x, 0, T.place.z]} rotation={[0, T.place.rotY, 0]}>
      {/* ===== chasis ===== */}
      <mesh position={[0, 0.84, hoodEndZ / 2]} castShadow material={darkMat}>
        <boxGeometry args={[T.box.width * 0.62, 0.16, hoodEndZ - 0.4]} />
      </mesh>

      {/* ===== caja seca ===== */}
      <mesh position={[0, T.deck + T.box.height / 2, T.box.len / 2]} castShadow receiveShadow material={boxMat}>
        <boxGeometry args={[T.box.width, T.box.height, T.box.len]} />
      </mesh>
      <mesh position={[0, T.deck, T.box.len / 2]} material={darkMat}>
        <boxGeometry args={[T.box.width - 0.04, 0.08, T.box.len]} />
      </mesh>
      {/* puerta trasera (cortina) + marco */}
      <mesh position={[0, T.deck + 2.34 / 2 + 0.05, 0.01]} material={darkMat}>
        <boxGeometry args={[2.39, 2.34, 0.06]} />
      </mesh>
      <mesh position={[0, T.deck + T.box.height / 2, 0]} material={chromeMat}>
        <boxGeometry args={[T.box.width + 0.02, T.box.height, 0.04]} />
      </mesh>

      {/* ===== cabina ===== */}
      <mesh position={[0, (T.cab.base + T.cab.top) / 2, cabMidZ]} castShadow material={bodyMat}>
        <boxGeometry args={[T.cab.width, T.cab.top - T.cab.base, T.cab.len]} />
      </mesh>
      {/* techo redondeado de cabina */}
      <mesh position={[0, T.cab.top, cabMidZ]} castShadow material={bodyMat}>
        <boxGeometry args={[T.cab.width - 0.06, 0.12, T.cab.len - 0.06]} />
      </mesh>

      {/* parabrisas inclinado + pilares A */}
      <mesh position={[0, 2.18, cabEndZ - 0.06]} rotation={[0.22, 0, 0]} material={glassMat}>
        <boxGeometry args={[T.cab.width - 0.26, 0.74, 0.05]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (chw - 0.1), 2.16, cabEndZ - 0.04]} rotation={[0.22, 0, 0]} material={bodyMat}>
          <boxGeometry args={[0.1, 0.82, 0.08]} />
        </mesh>
      ))}
      {/* visera */}
      <mesh position={[0, 2.56, cabEndZ - 0.16]} rotation={[0.32, 0, 0]} castShadow material={bodyMat}>
        <boxGeometry args={[T.cab.width - 0.08, 0.06, 0.3]} />
      </mesh>
      {/* ventanas laterales */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * chw, 2.05, cabMidZ + 0.08]} material={glassMat}>
          <boxGeometry args={[0.04, 0.62, T.cab.len - 0.5]} />
        </mesh>
      ))}
      {/* plafones ámbar en el frente del techo */}
      {[-0.4, 0, 0.4].map((mx) => (
        <mesh key={mx} position={[mx, T.cab.top + 0.04, cabEndZ - 0.08]} material={amberMat}>
          <boxGeometry args={[0.12, 0.05, 0.08]} />
        </mesh>
      ))}

      {/* espejos sobre brazos */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * (chw + 0.14), 2.05, cabEndZ - 0.1]} rotation={[0, 0, Math.PI / 2]} material={chromeMat}>
            <cylinderGeometry args={[0.022, 0.022, 0.3, 8]} />
          </mesh>
          <mesh position={[s * (chw + 0.3), 1.95, cabEndZ - 0.1]} castShadow material={darkMat}>
            <boxGeometry args={[0.07, 0.46, 0.2]} />
          </mesh>
        </group>
      ))}

      {/* ===== cofre inclinado ===== */}
      <mesh geometry={hoodGeo} position={[0, 0, hoodMidZ]} castShadow material={bodyMat} />

      {/* salpicaderas delanteras */}
      <Fender x={-chw + 0.04} z={T.axle.frontZ} />
      <Fender x={chw - 0.04} z={T.axle.frontZ} />

      {/* ===== frente: parrilla, faros, defensa ===== */}
      {/* marco cromado de parrilla */}
      <mesh position={[0, 1.24, hoodEndZ + 0.015]} material={chromeMat}>
        <boxGeometry args={[1.5, 0.66, 0.05]} />
      </mesh>
      {/* fondo oscuro */}
      <mesh position={[0, 1.24, hoodEndZ + 0.03]} material={darkMat}>
        <boxGeometry args={[1.36, 0.54, 0.04]} />
      </mesh>
      {/* persianas horizontales */}
      {[-0.2, -0.07, 0.06, 0.19].map((dy) => (
        <mesh key={dy} position={[0, 1.24 + dy, hoodEndZ + 0.055]} material={chromeMat}>
          <boxGeometry args={[1.32, 0.045, 0.03]} />
        </mesh>
      ))}
      {/* emblema (rombo International) */}
      <mesh position={[0, 1.52, hoodEndZ + 0.07]} rotation={[0, 0, Math.PI / 4]} material={chromeMat}>
        <boxGeometry args={[0.14, 0.14, 0.04]} />
      </mesh>
      {/* faros barridos */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 1.0, 1.16, hoodEndZ - 0.02]} rotation={[0, s * 0.4, 0]} castShadow material={darkMat}>
            <boxGeometry args={[0.5, 0.34, 0.16]} />
          </mesh>
          <mesh position={[s * 1.0, 1.16, hoodEndZ + 0.06]} rotation={[0, s * 0.4, 0]} material={lightMat}>
            <boxGeometry args={[0.42, 0.26, 0.05]} />
          </mesh>
        </group>
      ))}
      {/* defensa */}
      <mesh position={[0, T.bumper.height, hoodEndZ + 0.12]} castShadow material={bodyMat}>
        <boxGeometry args={[T.cab.width + 0.06, T.bumper.height, T.bumper.depth]} />
      </mesh>
      <mesh position={[0, T.bumper.height + 0.02, hoodEndZ + 0.245]} material={chromeMat}>
        <boxGeometry args={[T.cab.width + 0.08, 0.08, 0.03]} />
      </mesh>

      {/* ===== ruedas (4×2: delanteras simples, traseras duales) ===== */}
      <Wheel x={-T.axle.trackHalf} y={T.tire.radius} z={T.axle.frontZ} />
      <Wheel x={T.axle.trackHalf} y={T.tire.radius} z={T.axle.frontZ} />
      {[-1, 1].map((s) => (
        <group key={`dual-${s}`}>
          <Wheel x={s * (T.axle.trackHalf - T.tire.width / 2)} y={T.tire.radius} z={T.axle.rearZ} />
          <Wheel x={s * (T.axle.trackHalf + T.tire.width / 2)} y={T.tire.radius} z={T.axle.rearZ} />
        </group>
      ))}
    </group>
  )
}

export function Truck() {
  const x = useView((s) => s.truckX)
  return (
    <group>
      <TruckBody x={x} />
      <Leveler x={x} />
    </group>
  )
}
