import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import type { PointerLockControls as PLC } from 'three-stdlib'
import { buildColliders, type AABB } from '../constants/dims'
import { useView } from '../state/useView'
import { touch } from '../lib/touch'

const EYE = 1.65
const WALK = 3.0 // m/s
const RUN = 5.6 // m/s
const RADIUS = 0.32 // medio cuerpo del jugador
const ACCEL = 9 // suavizado de velocidad

// límites del mundo (para no vagar infinito por el terreno)
const BOUND = { minX: -18, maxX: 18, minZ: -18, maxZ: 44 }

function blocked(x: number, z: number, colliders: AABB[]): boolean {
  for (const c of colliders) {
    if (
      x > c.minX - RADIUS &&
      x < c.maxX + RADIUS &&
      z > c.minZ - RADIUS &&
      z < c.maxZ + RADIUS
    ) {
      return true
    }
  }
  return false
}

export function FPControls() {
  const { camera, gl } = useThree()
  const controls = useRef<PLC>(null)
  const colliders = useMemo(() => buildColliders(), [])
  const setPlayer = useView((s) => s.setPlayer)
  const setLocked = (v: boolean) => useView.setState({ locked: v })

  const keys = useRef<Record<string, boolean>>({})
  const vel = useRef(new THREE.Vector3())

  // look táctil (móvil): yaw/pitch propios cuando no hay pointer lock
  const yaw = useRef(Math.PI)
  const pitch = useRef(0)
  const touchLook = useRef(false)
  const lastTouch = useRef<{ x: number; y: number } | null>(null)

  // teclado
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true
    }
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // spawn al entrar al modo FP
  useEffect(() => {
    camera.position.set(7, EYE, 12)
    camera.lookAt(7, EYE, 0)
    yaw.current = Math.PI
    pitch.current = 0
    // FOV cómodo (evita mareo)
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = 60
    cam.updateProjectionMatrix()
  }, [camera])

  // look táctil por arrastre (cuando no hay pointer lock, p.ej. móvil)
  useEffect(() => {
    const el = gl.domElement
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      lastTouch.current = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !lastTouch.current) return
      const dx = e.clientX - lastTouch.current.x
      const dy = e.clientY - lastTouch.current.y
      lastTouch.current = { x: e.clientX, y: e.clientY }
      touchLook.current = true
      yaw.current -= dx * 0.005
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.005, -1.2, 1.2)
    }
    const onUp = () => {
      lastTouch.current = null
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
    }
  }, [gl])

  const fwd = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), [])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const k = keys.current
    const run = k['ShiftLeft'] || k['ShiftRight']
    const speed = run ? RUN : WALK

    // mirada táctil (móvil) cuando no hay pointer lock
    if (touchLook.current && !useView.getState().locked) {
      euler.set(pitch.current, yaw.current, 0)
      camera.quaternion.setFromEuler(euler)
    }

    let mz = 0
    let mx = 0
    if (k['KeyW'] || k['ArrowUp']) mz += 1
    if (k['KeyS'] || k['ArrowDown']) mz -= 1
    if (k['KeyD'] || k['ArrowRight']) mx += 1
    if (k['KeyA'] || k['ArrowLeft']) mx -= 1
    mz += touch.moveZ
    mx += touch.moveX

    // direcciones horizontales según la mirada
    camera.getWorldDirection(fwd)
    fwd.y = 0
    if (fwd.lengthSq() > 1e-6) fwd.normalize()
    right.set(fwd.z, 0, -fwd.x) // perpendicular horizontal

    target.set(0, 0, 0)
    target.addScaledVector(fwd, mz)
    target.addScaledVector(right, mx)
    if (target.lengthSq() > 1e-6) target.normalize().multiplyScalar(speed)

    // inercia (suavizado exponencial)
    const t = 1 - Math.exp(-ACCEL * dt)
    vel.current.lerp(target, t)

    const pos = camera.position
    let nx = pos.x + vel.current.x * dt
    let nz = pos.z + vel.current.z * dt

    // colisión por eje (deslizar al chocar)
    if (blocked(nx, pos.z, colliders)) {
      nx = pos.x
      vel.current.x = 0
    }
    if (blocked(nx, nz, colliders)) {
      nz = pos.z
      vel.current.z = 0
    }

    nx = THREE.MathUtils.clamp(nx, BOUND.minX, BOUND.maxX)
    nz = THREE.MathUtils.clamp(nz, BOUND.minZ, BOUND.maxZ)

    pos.set(nx, EYE, nz)

    // minimapa
    const angle = Math.atan2(fwd.x, fwd.z)
    setPlayer(nx, nz, angle)
  })

  return (
    <PointerLockControls
      ref={controls}
      onLock={() => setLocked(true)}
      onUnlock={() => setLocked(false)}
    />
  )
}
