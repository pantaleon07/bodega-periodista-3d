import { Suspense } from 'react'
import { Environment, Sky } from '@react-three/drei'
import { EAVE, RIDGE, PLANT } from '../constants/dims'
import { ErrorBoundary } from '../lib/ErrorBoundary'
import { useView } from '../state/useView'

const SUN = { x: 22, y: 16, z: 18 } // dirección del sol (cálido, raking)

function Luminaire({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      {/* carcasa */}
      <mesh>
        <boxGeometry args={[0.5, 0.12, 1.5]} />
        <meshStandardMaterial color="#2c2d31" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* tubo emisivo (lo recoge el bloom) */}
      <mesh position={[0, -0.07, 0]}>
        <boxGeometry args={[0.34, 0.05, 1.36]} />
        <meshStandardMaterial
          color="#fff1cf"
          emissive="#ffdca6"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        position={[0, -0.3, 0]}
        color="#ffdca6"
        intensity={14}
        distance={16}
        decay={2}
      />
    </group>
  )
}

export function Lighting() {
  const ly = RIDGE - 1.6 // luminarias colgadas bajo la bóveda
  const sunIntensity = useView((s) => s.sunIntensity)
  const fillIntensity = useView((s) => s.fillIntensity)
  return (
    <group>
      {/* HDRI para reflejos (no como fondo); aislado por si no hay red */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <Environment preset="warehouse" environmentIntensity={0.55} />
        </Suspense>
      </ErrorBoundary>

      {/* cielo físico exterior */}
      <Sky
        distance={450000}
        sunPosition={[SUN.x, SUN.y, SUN.z]}
        turbidity={2.6}
        rayleigh={0.7}
        mieCoefficient={0.005}
        mieDirectionalG={0.86}
      />

      {/* sol */}
      <directionalLight
        position={[SUN.x, SUN.y, SUN.z]}
        intensity={sunIntensity}
        color="#fff0d8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      {/* relleno frío suave del lado opuesto */}
      <directionalLight position={[-16, 12, -10]} intensity={fillIntensity} color="#cfe0ff" />

      {/* ambiente / cielo-suelo */}
      <hemisphereLight args={['#dfe7f2', '#6b6356', 0.45]} />
      <ambientLight intensity={0.12} />

      {/* luminarias interiores cálidas */}
      {[-6, 0, 6].map((z) =>
        [-4.5, 4.5].map((x) => <Luminaire key={`${x}-${z}`} x={x} z={z} y={ly} />),
      )}
      {/* un par sobre el pasillo de acceso */}
      <Luminaire x={-0.9} z={3} y={EAVE - 0.4} />
      <Luminaire x={-0.9} z={-2} y={ly} />

      {/* foco de patio (exterior, sobre el portón) */}
      <pointLight position={[-0.9, EAVE + 0.5, PLANT.maxZ + 1.5]} intensity={8} distance={18} decay={2} color="#ffedd0" />
    </group>
  )
}
