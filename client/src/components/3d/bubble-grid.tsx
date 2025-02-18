import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, Canvas, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion } from 'framer-motion-3d';
import { BubbleWithUser } from '@shared/schema';

interface BubbleProps {
  position: [number, number, number];
  scale: number;
  color: string;
  onClick?: () => void;
  isHovered?: boolean;
}

function Bubble({ position, scale, color, onClick, isHovered }: BubbleProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating motion
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.001;
      
      if (isHovered) {
        // Pulsating effect when hovered
        meshRef.current.scale.x = scale * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
        meshRef.current.scale.y = scale * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
        meshRef.current.scale.z = scale * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
      }
    }
  });

  return (
    <motion.mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={onClick}
      whileHover={{ scale: scale * 1.2 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhongMaterial
        color={color}
        transparent
        opacity={0.6}
        shininess={100}
        specular={new THREE.Color("#ffffff")}
      />
    </motion.mesh>
  );
}

function BubbleScene({ bubbles, onBubbleClick }: { 
  bubbles: BubbleWithUser[],
  onBubbleClick: (bubble: BubbleWithUser) => void 
}) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    camera.position.z = 15;
  }, [camera]);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {bubbles.map((bubble, i) => {
        const theta = (i / bubbles.length) * Math.PI * 2;
        const radius = 8;
        const x = Math.cos(theta) * radius;
        const y = Math.sin(theta) * radius;
        const z = Math.random() * 5 - 2.5;

        // Calculate remaining time color (yellow to transparent)
        const timeColor = new THREE.Color("#FFD700");
        
        return (
          <Bubble
            key={bubble.id}
            position={[x, y, z]}
            scale={1 + (bubble.likes || 0) * 0.1}
            color={timeColor.getStyle()}
            onClick={() => onBubbleClick(bubble)}
          />
        );
      })}
    </group>
  );
}

export function BubbleGrid({ 
  bubbles,
  onBubbleClick
}: {
  bubbles: BubbleWithUser[],
  onBubbleClick: (bubble: BubbleWithUser) => void
}) {
  return (
    <div className="w-full h-screen bg-[#1A1A1A]">
      <Canvas>
        <BubbleScene bubbles={bubbles} onBubbleClick={onBubbleClick} />
        <EffectComposer>
          <Bloom
            intensity={1.0}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
