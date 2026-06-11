import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export function Scene({ packets, isPaused, playbackResetCounter, onHoverVehicle, onSelectVehicle, selectedVehicleId }) {
  const vehicleRefs = useRef([]);
  const fiberRefs = useRef([]);
  const lanePositions = [-6, -2, 2, 6]; 

  const processedVehicles = useMemo(() => {
    vehicleRefs.current = [];
    return packets.map((packet, index) => {
      let laneIndex = 0;
      let color = '#06b6d4'; 
      let dimensions = [1.2, 0.8, 2.2]; 
      let direction = "OUTBOUND";

      if (packet.protocol === 'DNS') {
        laneIndex = 0;
        color = '#fbbf24'; 
        dimensions = [0.8, 0.5, 1.4];
        direction = "OUTBOUND";
      } else if (packet.protocol === 'HTTPS') {
        laneIndex = 1;
        color = '#10b981'; 
        dimensions = [1.6, 1.2, 3.6];
        direction = "OUTBOUND";
      } else if (packet.protocol === 'HTTP') {
        laneIndex = 2;
        color = '#f97316'; 
        dimensions = [1.3, 0.9, 2.6];
        direction = "INBOUND";
      } else {
        laneIndex = 3;
        color = '#a855f7'; 
        dimensions = [1.1, 0.7, 2.0];
        direction = "INBOUND";
      }

      return {
        id: packet.id || index,
        src: packet.src || "UNKNOWN_SRC",
        dst: packet.dst || "UNKNOWN_DST",
        ip_id: packet.ip_id || 0,
        protocol: packet.protocol,
        size: packet.size || 64,
        x: lanePositions[laneIndex],
        z: direction === "OUTBOUND" ? (index * 18) + 25 : -(index * 18) - 45, 
        color,
        dimensions,
        direction,
        speed: (packet.speed || 6) * 1.2 
      };
    });
  }, [packets, playbackResetCounter]);

  const dataFibers = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: (i * 1.5) - 8.25,
      zOffset: Math.random() * 50,
      speed: Math.random() * 15 + 8
    }));
  }, []);

  useFrame((state, delta) => {
    if (isPaused) return;

    vehicleRefs.current.forEach((vehicle) => {
      if (!vehicle || vehicle.userData.hasFinished) return;
      
      if (vehicle.userData.direction === "OUTBOUND") {
        vehicle.position.z -= delta * vehicle.userData.speed;
        if (vehicle.position.z < -85) {
          vehicle.userData.hasFinished = true;
          vehicle.visible = false;
        }
      } else {
        vehicle.position.z += delta * vehicle.userData.speed;
        if (vehicle.position.z > 55) {
          vehicle.userData.hasFinished = true;
          vehicle.visible = false;
        }
      }
    });

    fiberRefs.current.forEach((fiber) => {
      if (!fiber) return;
      fiber.position.z -= delta * fiber.userData.speed;
      if (fiber.position.z < -60) fiber.position.z = 40;
    });
  });

  return (
    <group>
      <color attach="background" args={['#010409']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 20, 0]} intensity={1.5} distance={100} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -10]}>
        <planeGeometry args={[20, 160]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.9} metalness={0.4} />
      </mesh>

      <mesh position={[-10.1, 0.1, -10]}>
        <boxGeometry args={[0.15, 0.2, 160]} />
        <meshBasicMaterial color="#ec4899" />
      </mesh>
      <mesh position={[10.1, 0.1, -10]}>
        <boxGeometry args={[0.15, 0.2, 160]} />
        <meshBasicMaterial color="#ec4899" />
      </mesh>

      <mesh position={[-0.08, 0.01, -10]}>
        <boxGeometry args={[0.06, 0.01, 160]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>
      <mesh position={[0.08, 0.01, -10]}>
        <boxGeometry args={[0.06, 0.01, 160]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>

      {dataFibers.map((fiber, idx) => (
        <mesh 
          key={fiber.id} 
          ref={(el) => (fiberRefs.current[idx] = el)}
          position={[fiber.x, 0.01, fiber.zOffset - 30]}
          userData={{ speed: fiber.speed }}
        >
          <boxGeometry args={[0.04, 0.01, 15]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
        </mesh>
      ))}

      <group position={[0, 0, -60]}>
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[22, 0.6, 1.5]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 5.4, 0.2]}>
          <boxGeometry args={[20, 0.15, 1.6]} />
          <meshBasicMaterial color="#d946ef" />
        </mesh>
      </group>

      {processedVehicles.map((v, idx) => {
        const isSelected = selectedVehicleId === v.id;
        return (
          <group 
            key={v.id} 
            ref={(el) => (vehicleRefs.current[idx] = el)} 
            position={[v.x, v.dimensions[1] / 2 + 0.05, v.z]}
            rotation={[0, v.direction === "INBOUND" ? Math.PI : 0, 0]}
            userData={{ speed: v.speed, direction: v.direction, hasFinished: false }}
          >
            <mesh 
              castShadow
              onPointerOver={(e) => {
                e.stopPropagation();
                onHoverVehicle(v);
              }}
              onPointerOut={(e) => {
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
                transparent={true} 
                opacity={0.3} 
                roughness={0.1} 
                metalness={0.9} 
                emissive={isSelected ? '#f43f5e' : '#000000'}
                emissiveIntensity={isSelected ? 0.6 : 0}
              />
            </mesh>

            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[v.dimensions[0] * 0.7, v.dimensions[1] * 0.7, v.dimensions[2] * 0.8]} />
              <meshStandardMaterial 
                color={v.color} 
                wireframe={true} 
                emissive={v.color}
                emissiveIntensity={0.8}
              />
            </mesh>

            <mesh position={[0, 0, -v.dimensions[2] / 2 - 0.02]}>
              <boxGeometry args={[v.dimensions[0] * 0.8, 0.08, 0.04]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>

            <Html distanceFactor={14} position={[0, v.dimensions[1] + 0.3, 0]}>
              <div style={{
                backgroundColor: 'rgba(13, 17, 23, 0.95)',
                border: isSelected ? '1px solid #f43f5e' : `1px solid ${v.color}`,
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#fff',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                fontFamily: 'monospace',
                textAlign: 'center'
              }}>
                <div style={{ color: v.color, fontWeight: 'bold', marginBottom: '4px' }}>{v.protocol}</div>
                <div style={{ color: '#94a3b8', fontSize: '9px' }}>{v.src}</div>
                <div style={{ color: '#64748b', fontSize: '8px', margin: '1px 0' }}>⬇</div>
                <div style={{ color: '#38bdf8', fontSize: '9px' }}>{v.dst}</div>
              </div>
            </Html>
          </group>
        );
      })}

      <EffectComposer>
        <Bloom intensity={2.0} luminanceThreshold={0.15} luminanceSmoothing={0.85} height={400} />
      </EffectComposer>
    </group>
  );
}
