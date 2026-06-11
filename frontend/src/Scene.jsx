import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

export function Scene({ packets, onHoverVehicle, onSelectVehicle, selectedVehicleId }) {
  const vehicleRefs = useRef([]);
  const lanePositions = [-6, -2, 2, 6]; 

  const processedVehicles = useMemo(() => {
    return packets.map((packet, index) => {
      let laneIndex = 0;
      let color = '#06b6d4'; 
      let dimensions = [0.8, 0.6, 1.6]; 

      if (packet.protocol === 'DNS') {
        laneIndex = 0;
        color = '#fbbf24'; 
        dimensions = [0.4, 0.4, 0.9]; 
      } else if (packet.protocol === 'HTTPS') {
        laneIndex = 1;
        color = '#10b981'; 
        dimensions = [1.2, 1.1, 3.2]; 
      } else if (packet.protocol === 'HTTP') {
        laneIndex = 2;
        color = '#f97316'; 
        dimensions = [0.9, 0.7, 2.0]; 
      } else {
        laneIndex = 3;
        color = '#8b5cf6'; 
        dimensions = [0.8, 0.6, 1.6]; 
      }

      return {
        id: packet.id || index,
        src: packet.src || "0.0.0.0",
        dst: packet.dst || "0.0.0.0",
        protocol: packet.protocol,
        size: packet.size,
        x: lanePositions[laneIndex],
        z: index * 4, 
        color,
        dimensions,
        speed: Math.max(3, (packet.size / 200) + 2) 
      };
    });
  }, [packets]);

  useFrame((state, delta) => {
    vehicleRefs.current.forEach((vehicle) => {
      if (!vehicle) return;
      vehicle.position.z -= delta * vehicle.userData.speed;
      if (vehicle.position.z < -60) {
        vehicle.position.z = 40;
      }
    });
  });

  return (
    <group>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 25, 5]} intensity={0.4} />

      {/* ROAD SURFACE */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -10]}>
        <planeGeometry args={[18, 150]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* NEON SIDEWALKS */}
      <mesh position={[-9.1, 0.05, -10]}>
        <boxGeometry args={[0.1, 0.1, 150]} />
        <meshBasicMaterial color="#ec4899" /> 
      </mesh>
      <mesh position={[9.1, 0.05, -10]}>
        <boxGeometry args={[0.1, 0.1, 150]} />
        <meshBasicMaterial color="#ec4899" />
      </mesh>

      {/* INTERNET GATEWAY ARC */}
      <mesh position={[0, 4, -50]}>
        <boxGeometry args={[20, 0.5, 1]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      <mesh position={[0, 4.3, -50]}>
        <boxGeometry args={[18, 0.1, 1.1]} />
        <meshBasicMaterial color="#a855f7" /> 
      </mesh>

      {/* GENERATE STYLIZED VEHICLES */}
      {processedVehicles.map((v, idx) => {
        const isSelected = selectedVehicleId === v.id;
        return (
          <group 
            key={v.id} 
            ref={(el) => (vehicleRefs.current[idx] = el)} 
            position={[v.x, v.dimensions[1]/2, v.z]}
            userData={{ speed: v.speed }}
          >
            <mesh 
              castShadow 
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
                onHoverVehicle(v);
              }}
              onPointerOut={(e) => {
                document.body.style.cursor = 'default';
                onHoverVehicle(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectVehicle(v);
              }}
            >
              <boxGeometry args={v.dimensions} />
              <meshStandardMaterial 
                color={isSelected ? '#f43f5e' : v.color} 
                roughness={0.3} 
                metalness={0.8}
                emissive={isSelected ? '#f43f5e' : '#000000'}
                emissiveIntensity={isSelected ? 0.5 : 0}
              />
            </mesh>
            <mesh position={[0, 0.1, -v.dimensions[2]/2 - 0.02]}>
              <boxGeometry args={[v.dimensions[0] * 0.7, 0.1, 0.05]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      })}

      <EffectComposer>
        <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
      </EffectComposer>
    </group>
  );
}
