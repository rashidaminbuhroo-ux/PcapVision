import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function PacketNode({ packet, index }) {
  const meshRef = useRef();
  
  // Spread the packets out along the X-axis based on their time
  const positionX = (index * 2) - 10;
  
  // Scale the box based on packet size
  const scale = Math.max(0.5, packet.size / 500);

  // Slowly rotate the packets for a cool effect
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[positionX, 0, 0]} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#06b6d4" />
    </mesh>
  );
}

export function Scene({ packets }) {
  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Map through the packet data and render a 3D box for each */}
      {packets.slice(0, 50).map((pkt, i) => (
        <PacketNode key={pkt.id} packet={pkt} index={i} />
      ))}
    </group>
  );
}