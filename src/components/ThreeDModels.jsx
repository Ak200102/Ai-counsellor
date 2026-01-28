import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Rotating Cube 3D Model
export function RotatingCube() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera position={[0, 0, 3]} fov={75} makeDefault />
      <OrbitControls enableZoom={true} enablePan={true} />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, 10]} intensity={0.5} color="#6366f1" />

      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#6366f1" metalness={0.7} roughness={0.2} />
      </mesh>

      <gridHelper args={[10, 10]} />
    </Canvas>
  );
}

// Floating Sphere with Glow
export function FloatingSphere() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(Date.now() * 0.001) * 0.01;
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera position={[0, 0, 3.5]} fov={75} makeDefault />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={4} />

      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, -5, 5]} intensity={0.8} color="#a855f7" />

      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.8}
          roughness={0.1}
          emissive="#6366f1"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Glowing ring */}
      <mesh>
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} />
      </mesh>
    </Canvas>
  );
}

// Rotating Pyramid
export function RotatingPyramid() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera position={[0, 1, 3]} fov={75} makeDefault />
      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={2} />

      <ambientLight intensity={0.6} />
      <pointLight position={[8, 8, 8]} intensity={1.2} />
      <pointLight position={[-8, 0, 5]} intensity={0.6} color="#f59e0b" />

      <mesh ref={meshRef}>
        <coneGeometry args={[1.5, 2.5, 64]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.3} />
      </mesh>

      <gridHelper args={[6, 6]} />
    </Canvas>
  );
}

// Animated Torus Knot
export function AnimatedTorus() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.004;
      meshRef.current.rotation.y += 0.006;
    }
  });

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera position={[0, 0, 3]} fov={75} makeDefault />
      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={3} />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, 0, 10]} intensity={0.8} color="#06b6d4" />

      <mesh ref={meshRef}>
        <torusKnotGeometry args={[0.7, 0.2, 256, 32]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.8} roughness={0.1} />
      </mesh>
    </Canvas>
  );
}

// 3D Icosahedron with Rainbow Colors
export function RainbowIcosahedron() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z += 0.002;
    }
  });

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera position={[0, 0, 3]} fov={75} makeDefault />
      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={2} />

      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, 5]} intensity={0.8} color="#ec4899" />

      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial color="#10b981" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Orbiting particles */}
      <OrbitingParticles />
    </Canvas>
  );
}

// Orbiting particles helper
function OrbitingParticles() {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 2;
        const y = Math.sin(angle) * 2;
        return (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial color={`hsl(${(i / 8) * 360}, 100%, 50%)`} />
          </mesh>
        );
      })}
    </group>
  );
}

// Simple Wireframe Dodecahedron
export function WireframeDodecahedron() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.007;
    }
  });

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera position={[0, 0, 3.5]} fov={75} makeDefault />
      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={2.5} />

      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />

      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[1]} />
        <meshStandardMaterial color="#60a5fa" wireframe={false} metalness={0.9} roughness={0.05} />
      </mesh>

      <edges>
        <lineBasicMaterial color="#60a5fa" linewidth={2} />
      </edges>
    </Canvas>
  );
}

// Pulsing Hexagon
export function PulsingHexagon() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.z += 0.01;
    }
  });

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera position={[0, 0, 3]} fov={75} makeDefault />
      <OrbitControls enableZoom={true} />

      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, -5, 5]} intensity={0.8} color="#f43f5e" />

      <mesh ref={meshRef}>
        <cylinderGeometry args={[1, 1, 0.1, 6]} />
        <meshStandardMaterial color="#f43f5e" metalness={0.7} roughness={0.2} emissive="#f43f5e" emissiveIntensity={0.3} />
      </mesh>

      <gridHelper args={[6, 6]} position={[0, -1.5, 0]} />
    </Canvas>
  );
}

// Nested Rotating Cubes
export function NestedCubes() {
  const mesh1Ref = useRef();
  const mesh2Ref = useRef();
  const mesh3Ref = useRef();

  useFrame(() => {
    if (mesh1Ref.current) mesh1Ref.current.rotation.x += 0.01;
    if (mesh2Ref.current) {
      mesh2Ref.current.rotation.y += 0.015;
      mesh2Ref.current.rotation.z += 0.008;
    }
    if (mesh3Ref.current) {
      mesh3Ref.current.rotation.x -= 0.012;
      mesh3Ref.current.rotation.y -= 0.006;
    }
  });

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera position={[0, 0, 4]} fov={75} makeDefault />
      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, 10]} intensity={0.6} color="#3b82f6" />

      <mesh ref={mesh1Ref} scale={[1.5, 1.5, 1.5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.3} />
      </mesh>

      <mesh ref={mesh2Ref} scale={[1, 1, 1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.6} roughness={0.2} wireframe={true} />
      </mesh>

      <mesh ref={mesh3Ref} scale={[0.5, 0.5, 0.5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ec4899" metalness={0.8} roughness={0.1} />
      </mesh>
    </Canvas>
  );
}

// Generic 3D Canvas wrapper for easy use
export function Model3D({ children, canvasProps = {} }) {
  return (
    <Canvas {...canvasProps} style={{ width: '100%', height: '100%', ...canvasProps.style }}>
      <PerspectiveCamera position={[0, 0, 3.5]} fov={75} makeDefault />
      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={2} />
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, 10]} intensity={0.6} color="#6366f1" />
      {children}
    </Canvas>
  );
}
