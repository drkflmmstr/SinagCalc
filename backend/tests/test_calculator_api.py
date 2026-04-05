from fastapi.testclient import TestClient

from app import app


client = TestClient(app)


def test_calculate_endpoint_returns_complete_payload():
    response = client.post(
        "/calculate",
        json={
            "zone": "ncr",
            "roof_area": "medium",
            "monthly_bill": "2000_to_3500",
            "quality_tier": "standard",
            "electricity_rate_php": 13.82,
            "system_type": "grid_tied",
        },
    )

    assert response.status_code == 200

    payload = response.json()

    assert payload["inputs"]["zone"] == "ncr"
    assert payload["inputs"]["system_type"] == "grid_tied"
    assert payload["system"]["coverage_pct"] == 100
    assert payload["financials"]["annual_gen_kwh"] > 0
    assert payload["environment"]["co2_tonnes_avoided"] > 0
    assert "Solar" in payload["recommendation"]


def test_calculate_endpoint_rejects_invalid_rate():
    response = client.post(
        "/calculate",
        json={
            "zone": "ncr",
            "roof_area": "medium",
            "monthly_bill": "2000_to_3500",
            "quality_tier": "standard",
            "electricity_rate_php": 100,
            "system_type": "grid_tied",
        },
    )

    assert response.status_code == 422
