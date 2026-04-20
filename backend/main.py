from typing import List
import random

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize the FastAPI application
app = FastAPI(
    title="Congestion Telemetry API",
    description="Endpoint for receiving highly compressed binary telemetry payloads to analyze congestion.",
    version="1.0.0"
)

# Configure CORS constraints for specific frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class CongestionHotspot(BaseModel):
    zone: str
    capacity_percent: int

# --- Mock Business Logic ---
def decode_telemetry_payload(payload: bytes) -> List[str]:
    """
    Simulates decoding a highly compressed binary telemetry payload.
    In a real scenario, this would deserialize Protobuf or FlatBuffers 
    into raw coordinate data. Here, we mock the extracted data.
    """
    # Randomly assign attendees to zones based on predefined weights
    zones = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "Food Court", "Main Stage"]
    
    # Base weights simulating natural attraction/density to different event areas
    weights = [10, 15, 5, 20, 10, 25, 40] 
    
    # Simulate extraction of a random total number of attendee locations
    total_attendees = random.randint(500, 2500)
    
    # Generate coordinates mapping to zones (simulating the decoded payload)
    simulated_attendees = random.choices(zones, weights=weights, k=total_attendees)
    
    return simulated_attendees

def aggregate_hotspots(attendee_zones: List[str]) -> List[CongestionHotspot]:
    """
    Aggregates raw attendee location data into congestion hotspots 
    based on static zone capacities.
    """
    # Max safe capacity per zone for the event layout
    zone_capacities = {
        "Zone A": 300,
        "Zone B": 400,
        "Zone C": 200,
        "Zone D": 500,
        "Zone E": 250,
        "Food Court": 600,
        "Main Stage": 1200
    }
    
    # Count attendees in each zone
    counts = {}
    for zone in attendee_zones:
        counts[zone] = counts.get(zone, 0) + 1
        
    # Translate counts into capacity percentages
    hotspots = []
    for zone, count in counts.items():
        max_cap = zone_capacities.get(zone, 500)
        # Calculate percentage (can optionally exceed 100% to represent overcrowding)
        percentage = int((count / max_cap) * 100)
        hotspots.append(CongestionHotspot(zone=zone, capacity_percent=max_cap if percentage < 0 else percentage))
        
    # Sort from highest congestion to lowest
    return sorted(hotspots, key=lambda x: x.capacity_percent, reverse=True)

# --- Routes ---
@app.post("/api/telemetry", response_model=List[CongestionHotspot])
async def ingest_telemetry(request: Request):
    """
    Ingests binary telemetry data containing raw attendee coordinates,
    decodes it, and returns aggregated zone congestion metrics.
    """
    try:
        # Read the raw binary payload
        raw_payload = await request.body()
        
        # 1. Decode the binary payload into raw mock data
        attendee_data = decode_telemetry_payload(raw_payload)
        
        # 2. Aggregate the raw data into congestion hotspots
        hotspots = aggregate_hotspots(attendee_data)
        
        return hotspots
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process telemetry: {str(e)}")

# Optional: Run development server if executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
