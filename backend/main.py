import tempfile
import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from scapy.all import rdpcap, IP

app = FastAPI(title="PcapVision API")

# Allow the React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload")
async def upload_pcap(file: UploadFile = File(...)):
    # Save the uploaded file to a temporary location
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pcap")
    try:
        content = await file.read()
        tmp.write(content)
        tmp.close()

        # Parse the PCAP file using Scapy
        packets_data = []
        packets = rdpcap(tmp.name)
        
        for i, pkt in enumerate(packets):
            if IP in pkt:
                packets_data.append({
                    "id": i,
                    "src": pkt[IP].src,
                    "dst": pkt[IP].dst,
                    "size": len(pkt),
                    "time": float(pkt.time)
                })
                
        # Return the parsed data to the web app
        return {"filename": file.filename, "packets": packets_data}
    
    finally:
        # Clean up the temp file
        os.unlink(tmp.name)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)