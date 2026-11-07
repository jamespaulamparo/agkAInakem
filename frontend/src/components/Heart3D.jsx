import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * A soft 3D heart with a slow, calm pulse (~50 bpm) that follows the pointer.
 * Pointer position sets a target rotation that the mesh lerps toward each frame;
 * dragging adds spin that decays back to rest.
 */
const pointer = { x: 0, y: 0, dragging: false, lastX: 0, spin: 0 }

function heartGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, -1.05)
  s.bezierCurveTo(-0.35, -0.72, -1.25, -0.25, -1.25, 0.38)
  s.bezierCurveTo(-1.25, 0.95, -0.82, 1.22, -0.5, 1.22)
  s.bezierCurveTo(-0.18, 1.22, 0, 0.98, 0, 0.78)
  s.bezierCurveTo(0, 0.98, 0.18, 1.22, 0.5, 1.22)
  s.bezierCurveTo(0.82, 1.22, 1.25, 0.95, 1.25, 0.38)
  s.bezierCurveTo(1.25, -0.25, 0.35, -0.72, 0, -1.05)
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.42, bevelEnabled: true, bevelThickness: 0.32, bevelSize: 0.26, bevelSegments: 24, curveSegments: 64 })
  g.center()
  return g
}

function Heart({ reduced }) {
  const group = useRef()
  const heart = useRef()
  const geo = useMemo(heartGeometry, [])
  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const ease = 1 - Math.pow(0.0015, delta)
    pointer.spin *= Math.pow(0.04, delta)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.x * 0.55 + (reduced ? 0 : Math.sin(t * 0.3) * 0.18), ease) + pointer.spin * delta
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.y * 0.35, ease)
    if (heart.current && !reduced) {
      // gentle "lub-dub": two soft bumps every 1.2s
      const p = (t % 1.2) / 1.2
      const beat = Math.exp(-Math.pow((p - 0.08) / 0.05, 2)) * 0.035 + Math.exp(-Math.pow((p - 0.24) / 0.05, 2)) * 0.022
      heart.current.scale.setScalar(1 + beat)
    }
  })
  return (
    <group ref={group}>
      <mesh ref={heart} geometry={geo} rotation={[0, 0, 0]}>
        <meshPhysicalMaterial color="#6DB8B0" roughness={0.32} metalness={0} clearcoat={0.6} clearcoatRoughness={0.35} sheen={0.4} sheenColor="#BFE3F5" />
      </mesh>
      <mesh scale={1.95} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[1, 0.006, 8, 160]} />
        <meshBasicMaterial color="#8EC5E8" transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[1.25, 0.35, 0]} scale={2.25}>
        <torusGeometry args={[1, 0.004, 8, 160]} />
        <meshBasicMaterial color="#A9C8A5" transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

export default function Heart3D() {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    const move = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
      if (pointer.dragging) { pointer.spin += (e.clientX - pointer.lastX) * 0.08; pointer.lastX = e.clientX }
    }
    const up = () => { pointer.dragging = false }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
  }, [])
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 6], fov: 40 }} gl={{ antialias: true, alpha: true }}
      onPointerDown={(e) => { pointer.dragging = true; pointer.lastX = e.clientX }}
      style={{ touchAction: 'pan-y', cursor: 'grab' }} aria-hidden="true">
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <pointLight position={[-4, -2, 3]} intensity={16} color="#8EC5E8" />
      <pointLight position={[4, -3, 2]} intensity={9} color="#A9C8A5" />
      <Heart reduced={reduced} />
    </Canvas>
  )
}

