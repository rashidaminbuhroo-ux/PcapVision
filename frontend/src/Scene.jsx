import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export function Scene({ packets }) {
  const vehicleRefs = useRef([]);
  const fiberRefs = useRef([]);
  const lanePositions = [-6, -2, 2, 6]; 

  // Process the raw PCAP telemetry packet array
  const processedVehicles = useMemo(() => {
    return packets.map((packet, index) => {
      let laneIndex = 0;
      let color = '#06b6d4'; 
      let dimensions = [1.2, 0.8, 2.2]; 

      if (packet.protocol === 'DNS') {
        laneIndex = 0;
        color = '#fbbf24'; 
        dimensions = [0.8, 0.5, 1.4]; 
      } else if (packet.protocol === 'HTTPS') {
        laneIndex = 1;
        color = '#10b981'; 
        dimensions = [1.6, 1.2, 3.6]; 
      } else if (packet.protocol === 'HTTP') {
        laneIndex = 2;
        color = '#f97316'; 
        dimensions = [1.3, 0.9, 2.6]; 
      } else {
        laneIndex = 3;
        color = '#a855f7'; 
        dimensions = [1.1, 0.7, 2.0]; 
      }

      return {
        id: packet.id || index,
        src: packet.src || "UNKNOWN_SRC",
        dst: packet.dst || "UNKNOWN_DST",
        protocol: packet.protocol,
        size: packet.size || 64,
        x: lanePositions[laneIndex],
        z: index * 5, // Clean defensive spacing
        color,
        dimensions,
        speed: packet.speed || 5
      };
    });
  }, [packets]);

  // Generate glowing highway data fibers beneath the traffic
  const dataFibers = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: (i * 1.5) - 8.25,
      zOffset: Math.random() * 50,
      speed: floatOffset(5, 15)
    }));
  }, []);

  function floatOffset(min, max) {
    return Math.random() * (max - min) + min;
  }

  useFrame((state, delta) => {
    // Animate Vehicles down the pipeline
    vehicleRefs.current.forEach((vehicle) => {
      if (!vehicle) return;
      vehicle.position.z -= delta * vehicle.userData.speed;
      if (vehicle.position.z < -70) {
        vehicle.position.z = 50; 
      }
    });

    // Animate underlying fiber optic stream matrix
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

      {/* TACTICAL ROADWAY GROUND */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -10]}>
        <planeGeometry args={[20, 160]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.9} metalness={0.4} />
      </mesh>

      {/* CYBERPUNK NEON SIDE BARRIERS */}
      <mesh position={[-10.1, 0.1, -10]}>
        <boxGeometry args={[0.15, 0.2, 160]} />
        <meshBasicMaterial color="#ec4899" />
      </mesh>
      <mesh position={[10.1, 0.1, -10]}>
        <boxGeometry args={[0.15, 0.2, 160]} />
        <meshBasicMaterial color="#ec4899" />
      </mesh>

      {/* STREAMING DATA FIBERS LINES */}
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

      {/* HIGHWAY INTERNET GATEWAY HUB */}
      <group position={[0, 0, -60]}>
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[22, 0.6, 1.5]} />
          <meshStandardMaterial color="#0f172a" dark={true} />
        </mesh>
        <mesh position={[0, 5.4, 0.2]}>
          <boxGeometry args={[20, 0.15, 1.6]} />
          <meshBasicMaterial color="#d946ef" />
        </mesh>
      </group>

      {/* ADVANCED CIRCUIT ENCAPSULATED VEHICLES */}
      {processedVehicles.map((v, idx) => (
        <group 
          key={v.id} 
          ref={(el) => (vehicleRefs.current[idx] = el)} 
          position={[v.x, v.dimensions[1] / 2 + 0.05, v.z]}
          userData={{ speed: v.speed }}
        >
          {/* Outer Protective Transparent
