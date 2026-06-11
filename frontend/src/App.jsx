import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Scene } from './Scene';

function App() {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(false);

  const metrics = useMemo(() => {
    if (packets.length === 0) return { dns: 0, https: 0, http: 0, totalBytes: 0 };
    let dns = 0, https = 0, http = 0;
    let totalBytes = 0;
    
    packets.forEach(p => {
      totalBytes += p.size || 64;
      if (p.protocol === 'DNS') dns++;
      else if (p.protocol === 'HTTPS') https++;
      else if (p.protocol === 'HTTP') http++;
    });

    return { dns, https, http, totalBytes: (totalBytes / 1024).toFixed(1) };
  }, [packets]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://pcapvision.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setPackets(data.packets || []);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("System deployment error. Ensure Render server instance is awake.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', color: '#f8fafc', backgroundColor: '#020617', fontFamily: 'monospace', overflow: 'hidden', position: 'relative' }}>
      
      {/* TOP HEADER */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', boxSizing: 'border-box', borderBottom: '1px solid #1e293b', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '6px 10px', backgroundColor: '#ec4899', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>PH</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', letterSpacing: '1px', color: '#ec4899' }}>PACKET HIGHWAY</h2>
            <span style={{ fontSize: '10px', color: '#64748b' }}>3D NETWORK INTERCEPT PIPELINE</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input type="file" accept=".pcap,.pcapng" onChange={handleFileUpload} id="pcap-upload" style={{ display: 'none' }} />
          <label htmlFor="pcap-upload" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}>
            {loading ? "PARSING PACKETS..." : "⚡ OPEN PCAP CORE"}
          </label>
        </div>
      </div>

      {/* LEFT-SIDE HUD */}
      <div style={{ position: 'absolute', top: 80, left: 20, width: '280px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 20px 40px rgba(0,0,0,0.7)' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>BANDWIDTH LOGISTICS</span>
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#38bdf8' }}>▼ PAYLOAD MAP</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f8fafc' }}>{metrics.totalBytes} <span style={{ fontSize: '12px' }}>KB</span></div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#4ade80' }}>▲ STREAM COUNT</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>{packets.length}</div>
            </div>
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #1e293b', margin: 0 }} />

        <div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>PROTOCOL DISTRIBUTION</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
              <span>● HTTPS (HEAVY CARGO)</span> <span>{metrics.https}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24' }}>
              <span>● DNS (MOTORCYCLES)</span> <span>{metrics.dns}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f97316' }}>
              <span>● HTTP (SEDANS)</span> <span>{metrics.http}</span>
            </div>
          </div>
        </div>
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 4, 18]} fov={60} />
        <Scene packets={packets} />
        <OrbitControls maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={40} />
      </Canvas>
      
    </div>
  );
}

export default App;
