import { useMemo } from 'react'
import * as THREE from 'three'
import { Line, Text, Billboard } from '@react-three/drei'
import { ROOMS, OPENINGS, EAVE, RIDGE } from '../constants/dims'

const COLOR = '#23d6c4' // teal de cotas
const Y = 0.06 // sobre el piso

type P3 = [number, number, number]

interface DimDef {
  a: P3
  b: P3
  label: string
  tick?: P3 // dirección de las marcas extremas (si no, se calcula)
}

function Dim({ a, b, label, tick }: DimDef) {
  const A = new THREE.Vector3(...a)
  const B = new THREE.Vector3(...b)
  const mid = A.clone().add(B).multiplyScalar(0.5)
  let t: THREE.Vector3
  if (tick) t = new THREE.Vector3(...tick)
  else {
    const d = B.clone().sub(A)
    t =
      Math.abs(d.y) < 1e-4
        ? new THREE.Vector3(-d.z, 0, d.x).normalize().multiplyScalar(0.25)
        : new THREE.Vector3(0.25, 0, 0)
  }
  const seg = (p: THREE.Vector3): [P3, P3] => [
    [p.x + t.x, p.y + t.y, p.z + t.z],
    [p.x - t.x, p.y - t.y, p.z - t.z],
  ]
  return (
    <group>
      <Line points={[a, b]} color={COLOR} lineWidth={1.6} />
      <Line points={seg(A)} color={COLOR} lineWidth={1.6} />
      <Line points={seg(B)} color={COLOR} lineWidth={1.6} />
      <Billboard position={[mid.x, mid.y + 0.45, mid.z]}>
        <Text
          fontSize={0.32}
          color="#ffffff"
          outlineWidth={0.022}
          outlineColor="#0c5a53"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  )
}

const f = (n: number) => n.toFixed(2)

export function Dimensions() {
  const dims = useMemo<DimDef[]>(() => {
    const list: DimDef[] = []

    // ---- huella total (afuera) ----
    list.push({ a: [-10, Y, -10.9], b: [10, Y, -10.9], label: '20.00' })
    list.push({ a: [10.9, Y, -10], b: [10.9, Y, 10], label: '20.00' })

    // ---- cuartos: ancho (sobre borde sur) + fondo (sobre borde oeste) ----
    const rooms = ROOMS.filter((r) => r.id !== 'bodega')
    for (const r of rooms) {
      const xa = Math.min(r.x1, r.x2)
      const xb = Math.max(r.x1, r.x2)
      const za = Math.min(r.z1, r.z2)
      const zb = Math.max(r.z1, r.z2)
      // ancho (X) sobre el borde norte del cuarto (un poco adentro)
      list.push({ a: [xa, Y, za + 0.3], b: [xb, Y, za + 0.3], label: f(xb - xa) })
      // fondo (Z) sobre el borde oeste
      list.push({ a: [xa + 0.3, Y, za], b: [xa + 0.3, Y, zb], label: f(zb - za) })
    }
    // bodega mayor: fondo (10 m) al oeste
    list.push({ a: [-9.4, Y, -10], b: [-9.4, Y, 0], label: '10.00' })

    // ---- portón (fachada, afuera) ----
    list.push({
      a: [OPENINGS.porton.x1, 0.1, 10.6],
      b: [OPENINGS.porton.x2, 0.1, 10.6],
      label: f(OPENINGS.porton.x2 - OPENINGS.porton.x1),
    })

    // ---- alturas de la bóveda (frontón norte, afuera) ----
    list.push({ a: [-9, 0, -10.7], b: [-9, EAVE, -10.7], label: `${f(EAVE)} (alero)` })
    list.push({ a: [0, 0, -10.7], b: [0, RIDGE, -10.7], label: `${f(RIDGE)} (caballete)` })

    return list
  }, [])

  return (
    <group>
      {dims.map((d, i) => (
        <Dim key={i} {...d} />
      ))}
    </group>
  )
}
