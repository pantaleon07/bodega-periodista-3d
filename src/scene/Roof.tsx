import { useMemo } from 'react'
import * as THREE from 'three'
import { PLANT, ROOF, RIDGE } from '../constants/dims'
import { makeVaultGeometry, arcCurve } from '../lib/geometry'
import { mat } from '../lib/materials'

export function Roof() {
  const vault = useMemo(() => makeVaultGeometry(110), [])

  const ribGeo = useMemo(() => {
    const curve = arcCurve(72)
    return new THREE.TubeGeometry(curve, 72, 0.06, 8, false)
  }, [])

  // posiciones de costillas a lo largo de Z
  const ribZ = useMemo(() => {
    const zs: number[] = []
    for (let z = PLANT.minZ; z <= PLANT.maxZ + 1e-6; z += ROOF.ribEvery) zs.push(z)
    return zs
  }, [])

  return (
    <group>
      {/* cascarón de lámina (visible por dentro y por fuera) */}
      <mesh geometry={vault} castShadow receiveShadow material={mat.roof()} />

      {/* costillas de acero siguiendo el arco */}
      {ribZ.map((z, i) => (
        <mesh key={i} geometry={ribGeo} position={[0, -0.02, z]} castShadow material={mat.steel()} />
      ))}

      {/* viga de caballete (cumbrera) */}
      <mesh position={[0, RIDGE - 0.14, 0]} castShadow material={mat.steel()}>
        <boxGeometry args={[0.18, 0.26, PLANT.depth]} />
      </mesh>
    </group>
  )
}
