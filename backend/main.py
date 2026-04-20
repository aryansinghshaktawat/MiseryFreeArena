# -*- coding: utf-8 -*-
"""
This module implements the FastAPI backend for the MiseryFreeArena project.

It provides a single endpoint for ingesting compressed binary telemetry data,
processing it, and returning real-time venue congestion metrics. The design
prioritizes data security, input validation, and performance.
"""

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

import os

# Configure CORS constraints for specific production and local origins
# Data Security: CORS is strictly configured to only allow requests from the
# approved frontend domains. This prevents Cross-Site Request Forgery (CSRF)
# and other malicious cross-origin attacks.
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:3000,https://miseryfreearena.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# --- Models ---
class CongestionHotspot(BaseModel):
    """
    Pydantic model representing a single congestion hotspot in a venue zone.

    Attributes:
        zone (str): The name of the venue zone.
        capacity_percent (int): The calculated capacity percentage of the zone.
    """
    zone: str
    capacity_percent: int

import re
import html

# --- Mock Business Logic ---
def decode_telemetry_payload(payload: bytes) -> List[str]:
    """
    Simulates decoding a highly compressed binary telemetry payload.

    In a real-world scenario, this function would deserialize a format like
    Protobuf or FlatBuffers into structured data. This mock implementation
    demonstrates the data security and input validation steps that would
    be performed on the raw payload.

    Args:
        payload (bytes): The raw binary payload from the request.

    Returns:
        List[str]: A list of simulated attendee locations (zone names).

    Data Security & Input Validation:
        - The function first decodes the byte string, ignoring errors to prevent
          crashes from malformed UTF-8 sequences.
        - It then uses `re.sub` to strip any potential HTML/XML tags, a crucial
          step to prevent Cross-Site Scripting (XSS) if this data were ever
          rendered without further escaping.
        - `html.escape` is used as a second layer of defense to sanitize the
          string, turning special characters like '<', '>', and '&' into their
          safe HTML entity equivalents.
    """
    
    # Input Sanitization: Strip script patterns before evaluation mapping
    _sanitized_str = html.escape(re.sub(r'<[^>]*>', '', payload.decode('utf-8', errors='ignore')))

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
    Aggregates raw attendee location data into congestion hotspots.

    This function takes a list of zone names (representing individual attendees)
    and calculates the percentage of capacity for each zone based on predefined
    maximums.

    Args:
        attendee_zones (List[str]): A list of zone names where attendees are located.

    Returns:
        List[CongestionHotspot]: A list of CongestionHotspot objects, sorted
                                 from most to least congested.
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
    Ingests binary telemetry data, processes it, and returns congestion metrics.

    This is the main data ingestion endpoint. It expects a raw binary payload,
    performs security checks, decodes the data, aggregates it, and returns
    a JSON response.

    Args:
        request (Request): The incoming FastAPI request object.

    Returns:
        List[CongestionHotspot]: A list of congestion hotspot data.

    Raises:
        HTTPException:
            - 422: If the payload is empty or exceeds the maximum allowed size.
            - 500: For any other processing errors.

    Data Security & Input Validation:
        - The function reads the raw request body to handle binary data directly.
        - It performs a critical input validation check on the payload size.
          An empty payload or an excessively large one (here, > 1MB) is rejected
          with a 422 error. This prevents denial-of-service attacks that might
          exhaust server memory.
    """
    try:
        # Read the raw binary payload
        raw_payload = await request.body()
        
        # Validation: Ensure payload size is not malicious
        if not raw_payload or len(raw_payload) > 1024 * 1024:
             raise HTTPException(status_code=422, detail="Invalid telemetry payload size.")
        
        # 1. Decode the binary payload into raw mock data
        attendee_data = decode_telemetry_payload(raw_payload)
        
        # 2. Aggregate the raw data into congestion hotspots
        hotspots = aggregate_hotspots(attendee_data)
        
        return hotspots
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process telemetry: {str(e)}")

# Optional: Run development server if executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
