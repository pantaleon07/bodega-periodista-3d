import { useMemo } from 'react'
import { useView } from '../state/useView'
import { ROOMS, OPENINGS, PLANT, FLOW, COLORS } from '../constants/dims'

const SIZE = 190
// escala única en X y Z (sin distorsión); cubre la nave + margen
const HALF = Math.max(PLANT.halfX, PLANT.halfZ) + 1.5

const mx = (x: number) => ((x + HALF) / (2 * HALF)) * SIZE
// Z+ (sur/patio) hacia ABAJO, Z− (norte/fondo) hacia ARRIBA
const my = (z: number) => ((z + HALF) / (2 * HALF)) * SIZE

export function Minimap() {
  const px = useView((s) => s.playerX)
  const pz = useView((s) => s.playerZ)
  const angle = useView((s) => s.playerAngle)

  const plan = useMemo(() => {
    const fx = mx(PLANT.minX)
    const fy = my(PLANT.minZ)
    const fw = mx(PLANT.maxX) - fx
    const fh = my(PLANT.maxZ) - fy
    return (
      <g>
        {/* huella de la nave */}
        <rect x={fx} y={fy} width={fw} height={fh} fill="#1b1f27" stroke="#3a4250" strokeWidth={1.5} />
        {/* cuartos */}
        {ROOMS.filter((r) => r.id !== 'bodega').map((r) => {
          const x = mx(Math.min(r.x1, r.x2))
          const y = my(Math.min(r.z1, r.z2))
          const w = Math.abs(mx(r.x2) - mx(r.x1))
          const h = Math.abs(my(r.z2) - my(r.z1))
          const fill = r.id === 'oficina' ? COLORS.brandMaroon : '#39424f'
          return <rect key={r.id} x={x} y={y} width={w} height={h} fill={fill} opacity={0.85} stroke="#566" strokeWidth={0.6} />
        })}
        {/* flujo de descarga */}
        <line
          x1={mx(FLOW.laneX)}
          y1={my(FLOW.fromZ)}
          x2={mx(FLOW.laneX)}
          y2={my(FLOW.toZ)}
          stroke={COLORS.brandOrange}
          strokeWidth={2}
          strokeDasharray="4 3"
          markerEnd="url(#arrow)"
        />
        {/* portones (sur) */}
        {[OPENINGS.portonL, OPENINGS.portonR].map((o, i) => (
          <line
            key={i}
            x1={mx(o.x1)}
            y1={my(PLANT.maxZ)}
            x2={mx(o.x2)}
            y2={my(PLANT.maxZ)}
            stroke={COLORS.brandOrange}
            strokeWidth={3}
          />
        ))}
      </g>
    )
  }, [])

  const dirX = Math.sin(angle)
  const dirZ = Math.cos(angle)
  const cx = mx(px)
  const cy = my(pz)

  return (
    <div className="minimap">
      <svg viewBox={`-4 -4 ${SIZE + 8} ${SIZE + 8}`}>
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={COLORS.brandOrange} />
          </marker>
        </defs>
        {plan}
        {/* jugador */}
        <line x1={cx} y1={cy} x2={cx + dirX * 12} y2={cy + dirZ * 12} stroke="#fff" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={4.5} fill="#fff" stroke={COLORS.brandMaroon} strokeWidth={1.5} />
      </svg>
      <div className="mm-tags">
        <span>N ↑</span>
        <span>Patio ↓</span>
      </div>
    </div>
  )
}
