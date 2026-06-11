import tempfile
import os
import random
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from scapy.all import rdpcap, IP, TCP, UDP

app = FastAPI(title="PcapVision API")

# Allow the React frontend to talk to this API safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload")
async def upload_pcap(file: UploadFile = File(...)):
    # Create a clean temporary workspace for the file structure
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pcap")
    try:
        content = await file.read()
        tmp.write(content)
        tmp.close()

        packets_data = []
        packets = rdpcap(tmp.name)

        for i, pkt in enumerate(packets):
            if IP in pkt:
                # Default protocol fallbacks
                protocol_str = "TCP" if TCP in pkt else "UDP" if UDP in pkt else "IP"
                
                # Check layer configurations and ports to isolate protocol types
                if TCP in pkt:
                    sport = pkt[TCP].sport
                    dport = pkt[TCP].dport
                    if sport == 443 or dport == 443:
                        protocol_str = "HTTPS"
                    elif sport == 80 or dport == 80:
                        protocol_str = "HTTP"
                
                if UDP in pkt:
                    if pkt[UDP].sport == 53 or pkt[UDP].dport == 53:
                        protocol_str = "DNS"

                # Core data matrix generation for the 3D highway tracks
                packets_data.append({
                    "id": i,
                    "src": pkt[IP].src,
                    "dst": pkt[IP].dst,
                    "size": len(pkt), # Byte size directly translates to vehicle class dimensions
                    "time": float(pkt.time),
                    "protocol": protocol_str, 
                    "speed": random.uniform(4.0, 8.5) # Dynamic speed variations down the track
                })

        return {"filename": file.filename, "packets": packets_data}

    finally:
        # Prevent server clutter by deleting the cache trace instantly
        os.unlink(tmp.name)

if __name__ == "__main__":
    import uvicorn
    # Capture the environment port variable automatically for the cloud instance
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
