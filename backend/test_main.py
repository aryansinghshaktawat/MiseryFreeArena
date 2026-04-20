from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_ingest_telemetry_valid():
    response = client.post("/api/telemetry", content=b"\x00\x01\x02")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        assert "zone" in data[0]
        assert "capacity_percent" in data[0]

def test_ingest_telemetry_empty_payload():
    response = client.post("/api/telemetry", content=b"")
    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid telemetry payload size."

def test_ingest_telemetry_large_payload():
    large_payload = b"0" * (1024 * 1024 + 1)
    response = client.post("/api/telemetry", content=large_payload)
    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid telemetry payload size."
