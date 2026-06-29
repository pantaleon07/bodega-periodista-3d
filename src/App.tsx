import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { Scene } from './scene/Scene'
import { Hud } from './ui/Hud'
import { Minimap } from './ui/Minimap'
import { MobileControls } from './ui/MobileControls'
import { LevaPanel } from './ui/LevaPanel'
import { AreasPanel } from './ui/AreasPanel'
import { useView } from './state/useView'

export default function App() {
  const mode = useView((s) => s.mode)

  return (
    <div className="app">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [22, 15, 28], fov: 50, near: 0.1, far: 3000 }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.05
        }}
      >
        <color attach="background" args={['#9fb4d6']} />
        <fog attach="fog" args={['#c2cfe2', 80, 280]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <Hud />
      <AreasPanel />
      {mode === 'fp' && <Minimap />}
      {mode === 'fp' && <MobileControls />}

      <LevaPanel />
      <Leva collapsed titleBar={{ title: 'Ajustes' }} />
    </div>
  )
}
