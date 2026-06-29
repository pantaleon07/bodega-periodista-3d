import { useView } from '../state/useView'
import { TRUCK_LEN } from '../constants/dims'

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button className={`chip ${active ? 'on' : ''}`} onClick={onClick}>
      {label}
    </button>
  )
}

export function Hud() {
  const mode = useView((s) => s.mode)
  const setMode = useView((s) => s.setMode)
  const locked = useView((s) => s.locked)
  const helpOpen = useView((s) => s.helpOpen)
  const set = useView((s) => s.set)

  const showRoof = useView((s) => s.showRoof)
  const showLabels = useView((s) => s.showLabels)
  const showFlow = useView((s) => s.showFlow)
  const showRacks = useView((s) => s.showRacks)
  const showTruck = useView((s) => s.showTruck)
  const postFx = useView((s) => s.postFx)

  const showDims = useView((s) => s.showDims)
  const showAreas = useView((s) => s.showAreas)
  const measuring = useView((s) => s.measuring)
  const measureA = useView((s) => s.measureA)
  const measureB = useView((s) => s.measureB)

  const measureDist =
    measureA && measureB
      ? Math.hypot(measureB[0] - measureA[0], measureB[2] - measureA[2])
      : null

  return (
    <>
      {/* barra superior */}
      <div className="topbar">
        <div className="brand">
          <span className="dot" /> Bodega · Col. Periodista <em>400 m²</em>
        </div>

        <div className="seg">
          <button className={mode === 'ext' ? 'active' : ''} onClick={() => setMode('ext')}>
            Exterior
          </button>
          <button className={mode === 'fp' ? 'active' : ''} onClick={() => setMode('fp')}>
            Recorrido
          </button>
        </div>

        <div className="chips">
          <Chip label="Techo" active={showRoof} onClick={() => set({ showRoof: !showRoof })} />
          <Chip label="Etiquetas" active={showLabels} onClick={() => set({ showLabels: !showLabels })} />
          <Chip label="Flujo" active={showFlow} onClick={() => set({ showFlow: !showFlow })} />
          <Chip label="Anaqueles" active={showRacks} onClick={() => set({ showRacks: !showRacks })} />
          <Chip label="Camión" active={showTruck} onClick={() => set({ showTruck: !showTruck })} />
          <Chip label="Post" active={postFx} onClick={() => set({ postFx: !postFx })} />
          <span className="chip-sep" />
          <Chip label="Cotas" active={showDims} onClick={() => set({ showDims: !showDims })} />
          <Chip label="Áreas" active={showAreas} onClick={() => set({ showAreas: !showAreas })} />
          <Chip
            label="Medir"
            active={measuring}
            onClick={() =>
              set({
                measuring: !measuring,
                mode: 'ext',
                measureA: null,
                measureB: null,
              })
            }
          />
        </div>

        <button className="help-btn" onClick={() => set({ helpOpen: !helpOpen })}>
          ?
        </button>
      </div>

      {/* mira + pista en primera persona */}
      {mode === 'fp' && <div className="crosshair" />}
      {mode === 'fp' && !locked && (
        <div className="hint">
          Haz clic para mirar · <b>WASD</b> moverte · <b>Shift</b> correr · <b>Esc</b> soltar
        </div>
      )}

      {/* barra de medición */}
      {measuring && (
        <div className="measure-bar">
          <span className="tag">📏 Medir</span>
          {measureDist != null ? (
            <span className="val">{measureDist.toFixed(2)} m</span>
          ) : (
            <span className="muted">
              Haz clic en <b>2 puntos</b> del piso (arrastra para orbitar)
            </span>
          )}
          <button onClick={() => set({ measureA: null, measureB: null })}>Limpiar</button>
          <button onClick={() => set({ measuring: false })}>Salir</button>
        </div>
      )}

      {/* leyenda */}
      <div className="legend">
        <div><span className="sw" style={{ background: '#D4581A' }} /> Flujo de descarga</div>
        <div><span className="sw" style={{ background: '#8B1A2B' }} /> Almacén (farmacia)</div>
        <div><span className="sw" style={{ background: '#E8B100' }} /> Circulación</div>
        <div>
          <span
            className="sw"
            style={{
              background:
                'repeating-linear-gradient(45deg,#E8B100 0 3px,transparent 3px 6px)',
            }}
          />{' '}
          Cajón exclusivo tortón (11 m)
        </div>
      </div>

      {/* ayuda */}
      {helpOpen && (
        <div className="help-modal" onClick={() => set({ helpOpen: false })}>
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <h2>Cómo navegar</h2>
            <p>
              <b>Exterior</b>: arrastra para orbitar, rueda/pellizco para acercar. Sin auto-giro.
            </p>
            <p>
              <b>Recorrido (1ª persona)</b>: clic para capturar el cursor, <b>WASD</b> o flechas para
              caminar, <b>Shift</b> para correr, <b>Esc</b> para soltar. En móvil: joystick para
              moverte y arrastra con el dedo para mirar.
            </p>
            <hr />
            <p className="muted">
              Huella 20×20 m · bóveda alero 3.50 m / caballete 7.50 m · portón 4.55×4.5 m · camión
              ~{TRUCK_LEN.toFixed(1)} m arrimado de reversa con rampa niveladora.
            </p>
            <button className="close" onClick={() => set({ helpOpen: false })}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
