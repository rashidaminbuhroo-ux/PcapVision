import tempfile
import os
import random
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from scapy.all import rdpcap, IP, TCP, UDP

app = FastAPI(title="PcapVision API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload")
async def upload_pcap(file: UploadFile = File(...)):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pcap")
    try:
        content = await file.read()
        tmp.write(content)
        tmp.close()

        packets_data = []
        packets = rdpcap(tmp.name)

        for i, pkt in enumerate(packets):
            if IP in pkt:
                protocol_str = "TCP" if TCP in pkt else "UDP" if UDP in pkt else "IP"
                
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

                packets_data.append({
                    "id": i,
                    "src": pkt[IP].src,
                    "dst": pkt[IP].dst,
                    "ip_id": int(pkt[IP].id), # Extracted native IP identifier token field
                    "size": len(pkt), 
                    "time": float(pkt.time),
                    "protocol": protocol_str, 
                    "speed": random.uniform(8.5, 14.0) # Accelerated highway velocity metrics
                })

        return {"filename": file.filename, "packets": packets_data}

    finally:
        os.unlink(tmp.name)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
