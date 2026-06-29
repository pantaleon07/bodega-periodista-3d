import { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export function OrbitView() {
  const { camera } = useThree()

  useEffect(() => {
    // 3/4 desde la calle (sur / +Z) para ver portón + camión
    camera.position.set(22, 15, 28)
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = 50
    cam.updateProjectionMatrix()
    camera.lookAt(0, 2.6, 4)
  }, [camera])

  return (
    <OrbitControls
      makeDefault
      target={[0, 2.6, 2]}
      enableDamping
      dampingFactor={0.08}
      autoRotate={false}
      minDistance={7}
      maxDistance={70}
      maxPolarAngle={Math.PI / 2 - 0.04}
      enablePan
    />
  )
}
