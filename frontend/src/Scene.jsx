import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Scene({ packets }) {
  const vehicleRefs = useRef([]);

  // 1. Assign lanes and colors based on Protocols
  const getVehicleSettings = (protocol, size) => {
    switch(protocol) {
      case 'DNS': 
        return { laneX: -4, color: '#eab308', scale: [0.4, 0.4, 0.8] }; // Small, fast yellow motorcycles
      case 'HTTPS': 
        return { laneX: 0, color: '#10b981', scale: [1, 1, 2.5] };     // Big green trucks (Heavy payload)
      case 'HTTP': 
        return { laneX: 4, color: '#f97316', scale: [0.8, 0.6, 1.5] };  // Orange sedans
      default: 
        return { laneX: 2, color: '#6366f1', scale: [0.7, 0.6, 1.2] };  // Blue cars for generic TCP
    }
  };

  // 2. Animate vehicles moving down the highway lanes
  useFrame((state, delta) => {
    vehicleRefs.current.forEach((vehicle) => {
      if (vehicle) {
        // Move forward along Z axis toward the gateway
        vehicle.position.z -= delta * (vehicle.userData.speed || 5);
        
        # Reset position if they drive off into the horizon (infinite traffic loop)
        if (vehicle.position.z < -50) {
          vehicle.position.z = 20; 
        }
      }
    });
  });

  return (
    <group>
      {/* Ambient and spotlighting to create that cool cyber look */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} />

      {/* THE HIGHWAY ROAD */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -15]}>
        <planeGeometry args={[16, 100]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* THE 3D VEHICLES (GENERATED FROM PCAP PACKETS) */}
      {packets.map((packet, idx) => {
        const config = getVehicleSettings(packet.protocol, packet.size);
        
        return (
          <mesh 
            key={packet.id || idx}
            ref={(el) => (vehicleRefs.current[idx] = el)}
            position={[config.laneX, 0.3, idx * 3]} // Space them out on start
            userData={{ speed: packet.speed || 4 }}
          >
            <boxGeometry args={config.scale} />
            <meshStandardMaterial color={config.color} metalness={0.5} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}
