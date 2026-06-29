import { useView } from '../state/useView'
import { AREAS, FOOTPRINT_AREA } from '../constants/dims'

export function AreasPanel() {
  const show = useView((s) => s.showAreas)
  if (!show) return null

  return (
    <div className="areas-panel">
      <h4>Áreas por zona</h4>
      <ul>
        {AREAS.map((a) => (
          <li key={a.id}>
            <span>{a.label}</span>
            <b>{a.area.toFixed(1)} m²</b>
          </li>
        ))}
      </ul>
      <div className="total">
        <span>Huella total</span>
        <b>{FOOTPRINT_AREA} m²</b>
      </div>
    </div>
  )
}
