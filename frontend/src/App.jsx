import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Scene } from './Scene';

function App() {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    
    // Create form data to send the file
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send to our live Render cloud backend
      const response = await fetch('https://pcapvision.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setPackets(data.packets);
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to parse PCAP. Make sure your Render backend is awake!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* 2D UI Overlay */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: '24px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <h2 style={{ margin: '0 0 4px 0', color: '#06b6d4', fontSize: '24px', letterSpacing: '1px' }}>PcapVision</h2>
        <p style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '14px' }}>3D Network Traffic Analyzer</p>
        
        <input type="file" accept=".pcap,.pcapng" onChange={handleFileUpload} style={{ color: '#cbd5e1', marginBottom: '12px', display: 'block' }} />
        
        {loading && <p style={{ color: '#fbbf24', margin: 0, fontWeight: 'bold' }}>Parsing packets on backend...</p>}
        {!loading && packets.length > 0 && <p style={{ color: '#4ade80', margin: 0, fontWeight: 'bold' }}>Loaded {packets.length} packets!</p>}
      </div>

      {/* 3D WebGL Canvas */}
      <Canvas camera={{ position: [0, 5, 20], fov: 50 }}>
        <Scene packets={packets} />
        <OrbitControls />
      </Canvas>
      
    </div>
  );
}

export default App;
