import * as THREE from 'three'

// =============================================================================
//  Figuras humanas de referencia — 1.65 m de alto exacto, para dar escala a los
//  anaqueles de 3 m. Operarios con chaleco de alta visibilidad + casco.
// =============================================================================

const skinMat = new THREE.MeshStandardMaterial({ color: '#c98e63', roughness: 0.7 })
const pantsMat = new THREE.MeshStandardMaterial({ color: '#2b2f36', roughness: 0.8 })
const hatMat = new THREE.MeshStandardMaterial({ color: '#f2f3f5', roughness: 0.5 })

function vest(color: string) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, emissive: color, emissiveIntensity: 0.08 })
}

interface PersonProps {
  position: [number, number, number]
  rotation?: number
  color?: string
}

/** Persona estilizada de 1.65 m (pies en y=0, cabeza ~1.65). */
function Person({ position, rotation = 0, color = '#E0571C' }: PersonProps) {
  const vestMat = vest(color)
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* piernas */}
      {[-0.11, 0.11].map((x) => (
        <mesh key={x} position={[x, 0.43, 0]} castShadow material={pantsMat}>
          <cylinderGeometry args={[0.085, 0.075, 0.86, 12]} />
        </mesh>
      ))}
      {/* torso (chaleco) */}
      <mesh position={[0, 1.12, 0]} castShadow material={vestMat}>
        <cylinderGeometry args={[0.18, 0.165, 0.58, 14]} />
      </mesh>
      {/* brazos */}
      {[-0.245, 0.245].map((x) => (
        <mesh key={x} position={[x, 1.12, 0]} rotation={[0, 0, x < 0 ? 0.08 : -0.08]} castShadow material={vestMat}>
          <cylinderGeometry args={[0.058, 0.052, 0.56, 10]} />
        </mesh>
      ))}
      {/* cuello */}
      <mesh position={[0, 1.45, 0]} material={skinMat}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
      </mesh>
      {/* cabeza */}
      <mesh position={[0, 1.55, 0]} castShadow material={skinMat}>
        <sphereGeometry args={[0.105, 16, 16]} />
      </mesh>
      {/* casco */}
      <mesh position={[0, 1.6, 0]} castShadow material={hatMat}>
        <sphereGeometry args={[0.12, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 1.585, 0.02]} material={hatMat}>
        <cylinderGeometry args={[0.135, 0.135, 0.03, 16]} />
      </mesh>
    </group>
  )
}

export function People() {
  return (
    <group>
      {/* operarios en el frente (oeste) de los anaqueles — escala de 3 m */}
      <Person position={[1.0, 0, -5.9]} rotation={1.45} color="#E0571C" />
      <Person position={[1.0, 0, -7.6]} rotation={1.45} color="#d8e000" />
      <Person position={[3.6, 0, -0.8]} rotation={1.45} color="#E0571C" />
      {/* operario en la línea de circulación (acceso) */}
      <Person position={[-0.7, 0, -1.8]} rotation={0.0} color="#d8e000" />
      {/* operario junto al tortón (escala del camión) */}
      <Person position={[-2.7, 0, 12.4]} rotation={0.7} color="#E0571C" />
    </group>
  )
}
