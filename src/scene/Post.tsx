import { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { EffectComposer, N8AO, Bloom, SMAA, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useView } from '../state/useView'

export function Post() {
  const postFx = useView((s) => s.postFx)
  const { gl } = useThree()

  // Cuando el post está activo, el tone mapping lo hace el efecto ACES (una sola
  // vez). Cuando está apagado, lo hace el renderer.
  useEffect(() => {
    gl.toneMapping = postFx ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.05
    return () => {
      gl.toneMapping = THREE.ACESFilmicToneMapping
    }
  }, [gl, postFx])

  if (!postFx) return null

  return (
    <EffectComposer enableNormalPass multisampling={0}>
      <N8AO aoRadius={1.3} intensity={2.0} distanceFalloff={1} halfRes />
      <Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={0.55} />
      <SMAA />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
