# Inside your packet parsing loop on FastAPI:
packet_data = {
    "id": index,
    "size": len(packet), # Packet size decides if it's a car or a truck!
    "protocol": "HTTPS" if packet.haslayer('TLS') else "DNS" if packet.haslayer('DNS') else "HTTP" if packet.haslayer('HTTP') else "TCP",
    "speed": random.uniform(2, 5) # Random speed for vehicle variation
}
