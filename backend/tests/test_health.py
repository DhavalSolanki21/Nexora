def test_health_check(client):
    """
    Tests that the health check endpoint returns 200 OK and valid status parameters.
    """
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "nexora-api"
    assert "version" in data
