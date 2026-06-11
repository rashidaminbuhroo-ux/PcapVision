import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Scene } from './Scene';

function App() {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackResetCounter, setPlaybackResetCounter] = useState(0);
  const [hoveredVehicle, setHoveredVehicle] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const metrics = useMemo(() => {
    if (packets.length === 0) return { dns: 0, https: 0, http: 0, tcp: 0, totalBytes: 0 };
    let dns = 0, https = 0, http = 0, tcp = 0;
    let totalBytes = 0;
    
    packets.forEach(p => {
      totalBytes += p.size || 64;
      if (p.protocol === 'DNS') dns++;
      else if (p.protocol === 'HTTPS') https++;
      else if (p.protocol === 'HTTP') http++;
      else tcp++;
    });

    return { dns, https, http, tcp, totalBytes: (totalBytes / 1024).toFixed(1) };
  }, [packets]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    setSelectedVehicle(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // FIXED URL: Removed the accidental '-api' string layout parameter
      const response = await fetch('https://pcapvision.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setPackets(data.packets || []);
      setPlaybackResetCounter(prev => prev + 1);
      setIsPaused(false);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("System deployment error. Ensure Render server instance is awake.");
    } finally {
      setLoading(false);
    }
  };

  const resetPlaybackPipeline = () => {
    setPlaybackResetCounter(prev => prev + 1);
    setSelectedVehicle(null);
    setIsPaused(false);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', color: '#f8fafc', backgroundColor: '#010409', fontFamily: 'monospace', overflow: 'hidden', position: 'relative' }}>
      
      {/* TOP CONFIG HEADER */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', boxSizing: 'border-box', borderBottom: '1px solid #1f2937', backgroundColor: 'rgba(13, 17, 23, 0.7)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '6px 10px', backgroundColor: '#d946ef', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', color: '#000' }}>PH</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '15px', letterSpacing: '1px', color: '#d946ef' }}>PACKET HIGHWAY</h2>
            <span style={{ fontSize: '10px', color: '#4b5563' }}>REAL-TIME 3D TELEMETRY PIPELINE</span>
          </div>
        </div>
        <div>
          <input type="file" accept=".pcap,.pcapng" onChange={handleFileUpload} id="pcap-upload" style={{ display: 'none' }} />
          <label htmlFor="pcap-upload" style={{ padding: '8px 18px', backgroundColor: '#2563eb', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.5px' }}>
            {loading ? "EXTRACTING CORE DATA..." : "⚡ LOAD PCAP MATRIX"}
          </label>
        </div>
      </div>

      {/* METRICS PANEL */}
      <div style={{ position: 'absolute', top: 85, left: 20, width: '270px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', borderRadius: '8px', border: '1px solid #21262d', backgroundColor: 'rgba(13, 17, 23, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div>
          <span style={{ fontSize: '10px', color: '#4b5563', fontWeight: 'bold' }}>LOGISTICS RUNTIME</span>
          <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#38bdf8' }}>TOTAL PAYLOAD</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.totalBytes} <span style={{ fontSize: '11px', color: '#4b5563' }}>KB</span></div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#10b981' }}>CAPTURED STREAMS</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{packets.length}</div>
            </div>
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #21262d', margin: 0 }} />

        <div>
          <span style={{ fontSize: '10px', color: '#4b5563', fontWeight: 'bold' }}>TRAFFIC ROUTING CHANNELS</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
              <span>● HTTPS (HEAVY TRUCKS)</span> <span>{metrics.https}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24' }}>
              <span>● DNS (MOTORCYCLES)</span> <span>{metrics.dns}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f97316' }}>
              <span>● HTTP (MIDWAY SEDANS)</span> <span>{metrics.http}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a855f7' }}>
              <span>● TCP / OTHER (COUPES)</span> <span>{metrics.tcp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ADVANCED READOUT SLIDE-OUT PANEL WITH MAC LAYERS */}
      {selectedVehicle && (
        <div style={{ position: 'absolute', top: 85, right: 20, width: '330px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px', borderRadius: '8px', border: '1px solid #f43f5e', backgroundColor: 'rgba(13, 17, 23, 0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 20px 40px rgba(244,63,94,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#f43f5e', fontWeight: 'bold' }}>📡 LIVE HARDWARE LAYER INTERCEPT</span>
            <button onClick={() => setSelectedVehicle(null)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '16px' }}>×</button>
          </div>
          <div>
            <div style={{ fontSize: '9px', color: '#4b5563' }}>SOURCE MACHINE ADDRESS (MAC)</div>
            <div style={{ fontSize: '13px', color: '#a855f7', fontWeight: 'bold' }}>{selectedVehicle.src_mac}</div>
            <div style={{ fontSize: '9px', color: '#4b5563', marginTop: '4px' }}>SOURCE NETWORK IP</div>
            <div style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 'bold' }}>{selectedVehicle.src}</div>
          </div>
          <hr style={{ border: '0', borderTop: '1px solid #21262d', margin: 0 }} />
          <div>
            <div style={{ fontSize: '9px', color: '#4b5563' }}>DESTINATION MACHINE ADDRESS (MAC)</div>
            <div style={{ fontSize: '13px', color: '#a855f7', fontWeight: 'bold' }}>{selectedVehicle.dst_mac}</div>
            <div style={{ fontSize: '9px', color: '#4b5563', marginTop: '4px' }}>DESTINATION TARGET IP</div>
            <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'bold' }}>{selectedVehicle.dst}</div>
          </div>
          <hr style={{ border: '0', borderTop: '1px solid #21262d', margin: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#4b5563' }}>PROTOCOL</div>
              <div style={{ fontSize: '13px', color: selectedVehicle.color, fontWeight: 'bold' }}>{selectedVehicle.protocol}</div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#4b5563' }}>PAYLOAD SIZE</div>
              <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>{selectedVehicle.size} Bytes</div>
            </div>
          </div>
        </div>
      )}

      {/* TIMELINE MEDIA CONTROLLER INTERFACE */}
      {packets.length > 0 && (
        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 24px', backgroundColor: 'rgba(13, 17, 23, 0.9)', border: '1px solid #21262d', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
          <button onClick={() => setIsPaused(!isPaused)} style={{ background: 'none', border: 'none', color: isPaused ? '#4ade80' : '#f43f5e', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', fontFamily: 'monospace' }}>
            {isPaused ? "▶ RESUME FLOW" : "⏸ PAUSE PIPELINE"}
          </button>
          <div style={{ width: '1px', height: '14px', backgroundColor: '#21262d' }}></div>
          <button onClick={resetPlaybackPipeline} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', fontFamily: 'monospace' }}>
            🔄 REPLAY PCAP TIMELINE
          </button>
        </div>
      )}

      {/* LIVE INTERCEPT LABELS BAR */}
      {hoveredVehicle && (
        <div style={{ position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)', zIndex: 10, padding: '8px 16px', backgroundColor: 'rgba(13, 17, 23, 0.95)', border: '1px solid #2563eb', borderRadius: '4px', pointerEvents: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{hoveredVehicle.src} ➡️ {hoveredVehicle.dst}</div>
          <div style={{ fontSize: '9px', color: '#4b5563', marginTop: '2px' }}>CLICK INTERCEPT TO EXTRACT MAC NODE</div>
        </div>
      )}

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 6, 16]} fov={55} />
        <Scene 
          packets={packets} 
          isPaused={isPaused}
          playbackResetCounter={playbackResetCounter}
          onHoverVehicle={setHoveredVehicle}
          onSelectVehicle={setSelectedVehicle}
          selectedVehicleId={selectedVehicle ? selectedVehicle.id : null}
        />
        <OrbitControls maxPolarAngle={Math.PI / 2.1} minDistance={4} maxDistance={35} />
      </Canvas>
      
    </div>
  );
}

export default App;
