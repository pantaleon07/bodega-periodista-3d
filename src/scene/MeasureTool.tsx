import { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { Line, Text, Billboard } from '@react-three/drei'
import { useView } from '../state/useView'

const COLOR = '#ff4d4d'

function dist(a: [number, number, number], b: [number, number, number]) {
  return Math.hypot(b[0] - a[0], b[2] - a[2])
}

function Marker({ p }: { p: [number, number, number] }) {
  return (
    <group position={[p[0], 0, p[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.12, 0.2, 24]} />
        <meshBasicMaterial color={COLOR} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color={COLOR} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function MeasureTool() {
  const measuring = useView((s) => s.measuring)
  const a = useView((s) => s.measureA)
  const b = useView((s) => s.measureB)
  const { camera, gl } = useThree()

  // Click sobre el plano del piso (y=0) por raycast manual → ignora oclusores
  // (muros, racks) y siempre da el punto en el suelo. Un arrastre = órbita.
  useEffect(() => {
    if (!measuring) return
    const el = gl.domElement
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const hit = new THREE.Vector3()
    let downPos: { x: number; y: number } | null = null

    const onDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY }
    }
    const onUp = (e: PointerEvent) => {
      if (!downPos) return
      const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y)
      downPos = null
      if (moved > 6) return // fue arrastre (órbita)
      const r = el.getBoundingClientRect()
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1
      ray.setFromCamera(ndc, camera)
      if (!ray.ray.intersectPlane(plane, hit)) return
      const p: [number, number, number] = [hit.x, 0, hit.z]
      const st = useView.getState()
      if (!st.measureA || st.measureB) {
        useView.setState({ measureA: p, measureB: null })
      } else {
        useView.setState({ measureB: p })
      }
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
    }
  }, [measuring, camera, gl])

  return (
    <group>
      {a && <Marker p={a} />}
      {b && <Marker p={b} />}
      {a && b && (
        <>
          <Line points={[a, b]} color={COLOR} lineWidth={2.4} />
          <Billboard position={[(a[0] + b[0]) / 2, 0.9, (a[2] + b[2]) / 2]}>
            <Text
              fontSize={0.5}
              color="#ffffff"
              outlineWidth={0.04}
              outlineColor="#9c1414"
              anchorX="center"
              anchorY="middle"
            >
              {dist(a, b).toFixed(2)} m
            </Text>
          </Billboard>
        </>
      )}
    </group>
  )
}
