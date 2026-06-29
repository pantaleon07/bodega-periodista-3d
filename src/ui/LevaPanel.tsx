import { useEffect } from 'react'
import { useControls, folder } from 'leva'
import { useView } from '../state/useView'

/** Panel de afinación en vivo; escribe en el store de la vista. */
export function LevaPanel() {
  const set = useView((s) => s.set)

  const vals = useControls({
    Capas: folder({
      Techo: true,
      Etiquetas: true,
      Flujo: true,
      Anaqueles: false,
      Camión: true,
      PostFx: true,
    }),
    Iluminación: folder({
      Sol: { value: 2.4, min: 0, max: 5, step: 0.1 },
      Relleno: { value: 0.35, min: 0, max: 2, step: 0.05 },
    }),
    Camión: folder({
      PosX: { value: 8.645, min: -10, max: 12, step: 0.05 },
    }),
  })

  useEffect(() => {
    set({
      showRoof: vals.Techo,
      showLabels: vals.Etiquetas,
      showFlow: vals.Flujo,
      showRacks: vals.Anaqueles,
      showTruck: vals.Camión,
      postFx: vals.PostFx,
      sunIntensity: vals.Sol,
      fillIntensity: vals.Relleno,
      truckX: vals.PosX,
    })
  }, [vals, set])

  return null
}
