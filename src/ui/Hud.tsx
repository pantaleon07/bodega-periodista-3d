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

        <button className="help-btn" onClick={() => set({ helpOpen: !helpOpen })} title="Manual de uso">
          <span className="q">?</span> Ayuda
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

      {/* ayuda / manual */}
      {helpOpen && (
        <div className="help-modal" onClick={() => set({ helpOpen: false })}>
          <div className="card manual" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => set({ helpOpen: false })} aria-label="Cerrar">
              ✕
            </button>
            <h2>Manual de uso</h2>

            <h3>1 · Cambiar de vista</h3>
            <ul>
              <li>
                <b>Exterior</b> — vista en órbita: <b>arrastra</b> para girar alrededor, <b>rueda</b> del
                ratón (o pellizco en móvil) para acercar/alejar.
              </li>
              <li>
                <b>Recorrido</b> — primera persona: <b>clic</b> para capturar el cursor, <b>W A S D</b> o
                flechas para caminar, <b>Shift</b> para correr, <b>Esc</b> para soltar. En móvil: usa el
                <b> joystick</b> y arrastra con el dedo para mirar.
              </li>
            </ul>

            <h3>2 · Capas (se prenden y apagan con un clic)</h3>
            <ul>
              <li><b>Techo</b> — muestra u oculta la bóveda. Apágalo para ver el interior desde afuera.</li>
              <li><b>Etiquetas</b> — nombres y m² de cada zona.</li>
              <li><b>Flujo</b> — flechas de descarga y el cajón exclusivo del tortón.</li>
              <li><b>Anaqueles</b> — los racks y las personas de referencia.</li>
              <li><b>Camión</b> — el tortón y su rampa niveladora.</li>
              <li><b>Post</b> — efectos de realismo (sombras suaves, brillo). Apágalo si va lento.</li>
            </ul>

            <h3>3 · Herramientas de medición</h3>
            <ul>
              <li><b>Cotas</b> — muestra las acotaciones con las medidas reales.</li>
              <li><b>Áreas</b> — abre el panel con los m² de cada zona (arriba a la izquierda).</li>
              <li>
                <b>Medir</b> — haz <b>clic en 2 puntos del piso</b> y te da la distancia. Usa
                <b> Limpiar</b> o <b>Salir</b> en la barra de abajo. (Funciona en vista Exterior.)
              </li>
            </ul>

            <h3>4 · Extras</h3>
            <ul>
              <li><b>Minimapa</b> (abajo-izq., solo en Recorrido) — tu posición y hacia dónde miras.</li>
              <li><b>Leyenda</b> (abajo-der.) — qué significa cada color del piso.</li>
              <li><b>Ajustes</b> (arriba-der.) — ajusta en vivo el sol, el relleno y la posición del camión.</li>
            </ul>

            <hr />
            <p className="muted">
              Medidas: huella 20×20 m · bóveda alero 3.50 / caballete 7.50 m · portón 4.55×4.5 m ·
              camión ~{TRUCK_LEN.toFixed(1)} m de reversa al portón con rampa.
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
