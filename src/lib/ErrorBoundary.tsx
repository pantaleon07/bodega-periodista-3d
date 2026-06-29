import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}
interface State {
  failed: boolean
}

/** Aísla fallos (p.ej. HDRI sin red) para que la app no se quede en blanco. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }
  static getDerivedStateFromError(): State {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.warn('[ErrorBoundary] recurso no disponible:', err)
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}
