import { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export function OrbitView() {
  const { camera } = useThree()

  useEffect(() => {
    // 3/4 desde el patio (sur / +Z) para ver portones + camión
    camera.position.set(32, 22, 44)
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = 50
    cam.updateProjectionMatrix()
    camera.lookAt(0, 4, 6)
  }, [camera])

  return (
    <OrbitControls
      makeDefault
      target={[0, 4, 4]}
      enableDamping
      dampingFactor={0.08}
      autoRotate={false}
      minDistance={10}
      maxDistance={130}
      maxPolarAngle={Math.PI / 2 - 0.04}
      enablePan
    />
  )
}
