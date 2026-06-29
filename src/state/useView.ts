import { create } from 'zustand'

export type ViewMode = 'ext' | 'fp'

interface ViewState {
  mode: ViewMode
  setMode: (m: ViewMode) => void
  toggleMode: () => void

  // capas / opciones
  showRoof: boolean
  showLabels: boolean
  showFlow: boolean
  showRacks: boolean
  showTruck: boolean
  postFx: boolean

  // herramientas de decisión (paquete 1)
  showDims: boolean // acotaciones
  showAreas: boolean // panel de áreas
  measuring: boolean // regla de medición activa
  measureA: [number, number, number] | null
  measureB: [number, number, number] | null

  // afinación en vivo (leva)
  sunIntensity: number
  fillIntensity: number
  truckX: number

  set: (patch: Partial<Omit<ViewState, 'set'>>) => void

  // posición del jugador (para el minimapa) — [x, z] y ángulo (rad)
  playerX: number
  playerZ: number
  playerAngle: number
  setPlayer: (x: number, z: number, angle: number) => void

  // pointer lock activo (modo FP)
  locked: boolean

  // ayuda
  helpOpen: boolean
}

export const useView = create<ViewState>((set) => ({
  mode: 'ext',
  setMode: (m) => set({ mode: m }),
  toggleMode: () => set((s) => ({ mode: s.mode === 'ext' ? 'fp' : 'ext' })),

  showRoof: true,
  showLabels: true,
  showFlow: true,
  showRacks: true,
  showTruck: true,
  postFx: true,

  showDims: false,
  showAreas: false,
  measuring: false,
  measureA: null,
  measureB: null,

  sunIntensity: 2.4,
  fillIntensity: 0.35,
  truckX: -0.9,

  set: (patch) => set(patch),

  playerX: 0,
  playerZ: 6,
  playerAngle: Math.PI, // mirando al norte (hacia la bodega)
  setPlayer: (x, z, angle) => set({ playerX: x, playerZ: z, playerAngle: angle }),

  locked: false,

  helpOpen: false,
}))
