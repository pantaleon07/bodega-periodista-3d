import { useMemo } from 'react'
import * as THREE from 'three'
import { PLANT, SIDE_WALLS, OPENINGS, WALL, YARD, southWallColliders } from '../constants/dims'
import { makeFrontonShape } from '../lib/geometry'
import { mat } from '../lib/materials'
import { WallMesh } from './Walls'

function Fronton({ z, openings }: { z: number; openings: boolean }) {
  const geo = useMemo(() => {
    const shape = makeFrontonShape(openings)
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: WALL.perimeterThickness,
      bevelEnabled: false,
      curveSegments: 64,
    })
    g.translate(0, 0, -WALL.perimeterThickness / 2)
    g.computeVertexNormals()
    return g
  }, [openings])

  return <mesh geometry={geo} position={[0, 0, z]} castShadow receiveShadow material={mat.wall()} />
}

/** Zócalo gris oxford a lo largo de un tramo recto en Z constante. */
function BaseBand({ x1, x2, z }: { x1: number; x2: number; z: number }) {
  const w = Math.abs(x2 - x1)
  return (
    <mesh position={[(x1 + x2) / 2, WALL.baseHeight / 2, z]} receiveShadow material={mat.base()}>
      <boxGeometry args={[w, WALL.baseHeight, WALL.perimeterThickness + 0.04]} />
    </mesh>
  )
}

function PortonFrame() {
  const { x1, x2, height } = OPENINGS.porton
  const z = PLANT.maxZ
  const s = 0.2 // sección del marco
  const w = x2 - x1
  return (
    <group>
      {/* jambas */}
      <mesh position={[x1 - s / 2, height / 2, z]} castShadow material={mat.frame()}>
        <boxGeometry args={[s, height, 0.45]} />
      </mesh>
      <mesh position={[x2 + s / 2, height / 2, z]} castShadow material={mat.frame()}>
        <boxGeometry args={[s, height, 0.45]} />
      </mesh>
      {/* dintel */}
      <mesh position={[(x1 + x2) / 2, height + s / 2, z]} castShadow material={mat.frame()}>
        <boxGeometry args={[w + s * 2, s, 0.45]} />
      </mesh>
    </group>
  )
}

function Cortina() {
  const { x1, x2, height } = OPENINGS.cortina
  const z = PLANT.maxZ
  const w = x2 - x1
  // lamas horizontales (instancia visual simple con líneas en el material no;
  // usamos un slab + marco). Persiana medio abierta.
  return (
    <group>
      <mesh position={[(x1 + x2) / 2, height / 2, z]} castShadow receiveShadow material={mat.curtain()}>
        <boxGeometry args={[w, height, 0.08]} />
      </mesh>
      <mesh position={[(x1 + x2) / 2, height + 0.12, z]} castShadow material={mat.frame()}>
        <boxGeometry args={[w + 0.2, 0.18, 0.3]} />
      </mesh>
    </group>
  )
}

export function Shell() {
  const southSpans = useMemo(() => southWallColliders(), [])

  return (
    <group>
      {/* terreno general */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.03, 0]}
        receiveShadow
        material={mat.ground()}
      >
        <planeGeometry args={[PLANT.width + YARD.groundExtra, PLANT.depth + YARD.groundExtra]} />
      </mesh>

      {/* patio de maniobra (asfalto) al SUR de la fachada */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.015, PLANT.maxZ + YARD.front / 2]}
        receiveShadow
        material={mat.asphalt()}
      >
        <planeGeometry args={[YARD.width, YARD.front]} />
      </mesh>

      {/* firme de concreto de la bodega (20×20) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow material={mat.floor()}>
        <planeGeometry args={[PLANT.width, PLANT.depth]} />
      </mesh>

      {/* muros laterales (este / oeste) */}
      {SIDE_WALLS.map((w) => (
        <WallMesh key={w.id} wall={w} />
      ))}

      {/* frontones norte (lleno) y sur (con huecos) */}
      <Fronton z={PLANT.minZ} openings={false} />
      <Fronton z={PLANT.maxZ} openings={true} />

      {/* zócalo del frontón norte (lleno) */}
      <BaseBand x1={PLANT.minX} x2={PLANT.maxX} z={PLANT.minZ} />
      {/* zócalo del frontón sur (tramos, dejando libres portón y cortina) */}
      {southSpans.map((b, i) => (
        <BaseBand key={i} x1={b.cx - b.sx / 2} x2={b.cx + b.sx / 2} z={PLANT.maxZ} />
      ))}

      <PortonFrame />
      <Cortina />

      {/* umbral del portón resaltado (franja en el piso) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[(OPENINGS.porton.x1 + OPENINGS.porton.x2) / 2, 0.012, PLANT.maxZ - 0.25]}
      >
        <planeGeometry args={[OPENINGS.porton.x2 - OPENINGS.porton.x1, 0.5]} />
        <meshStandardMaterial color={'#1c1c1f'} roughness={0.6} />
      </mesh>
    </group>
  )
}
