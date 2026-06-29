import { useMemo } from 'react'
import * as THREE from 'three'
import { Text, Billboard } from '@react-three/drei'
import { FLOW, ROOMS, COLORS, TRUCK, boxTop, roomArea } from '../constants/dims'

function arrowShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-0.18, -0.7)
  s.lineTo(0.18, -0.7)
  s.lineTo(0.18, 0.1)
  s.lineTo(0.45, 0.1)
  s.lineTo(0, 0.85)
  s.lineTo(-0.45, 0.1)
  s.lineTo(-0.18, 0.1)
  s.lineTo(-0.18, -0.7)
  return s
}

export function FlowMarkers() {
  const geo = useMemo(() => new THREE.ShapeGeometry(arrowShape()), [])
  const arrowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: COLORS.brandOrange,
        emissive: COLORS.brandOrange,
        emissiveIntensity: 0.25,
        roughness: 0.6,
        side: THREE.DoubleSide,
      }),
    [],
  )

  const zs = useMemo(() => {
    const out: number[] = []
    for (let i = 0; i < FLOW.arrows; i++) {
      out.push(FLOW.fromZ + ((FLOW.toZ - FLOW.fromZ) * i) / (FLOW.arrows - 1))
    }
    return out
  }, [])

  return (
    <group>
      {zs.map((z, i) => (
        <mesh
          key={i}
          geometry={geo}
          material={arrowMat}
          position={[FLOW.laneX, 0.02, z]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      ))}
    </group>
  )
}

export function ZoneLabels() {
  const labels = useMemo(() => {
    const list = ROOMS.map((r) => ({
      text: `${r.label}\n${roomArea(r).toFixed(1)} m²`,
      x: (r.x1 + r.x2) / 2,
      z: (r.z1 + r.z2) / 2,
      y: Math.min(r.height - 0.4, 2.9),
    }))
    // etiqueta del camión
    list.push({
      text: 'TORTÓN',
      x: TRUCK.place.x,
      z: TRUCK.place.z + TRUCK.box.len * 0.5,
      y: boxTop + 0.7,
    })
    return list
  }, [])

  return (
    <group>
      {labels.map((l, i) => (
        <Billboard key={i} position={[l.x, l.y, l.z]}>
          <Text
            fontSize={0.42}
            color="#ffffff"
            outlineWidth={0.03}
            outlineColor={COLORS.brandMaroon}
            anchorX="center"
            anchorY="middle"
          >
            {l.text}
          </Text>
        </Billboard>
      ))}
    </group>
  )
}
