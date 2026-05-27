import io


def test_dataset_upload_success(client, sample_csv):
    """
    Tests that a valid CSV file can be uploaded and profiled successfully.
    """
    csv_data = sample_csv(rows=5)
    file_payload = {
        "file": (
            "test_student_scores.csv",
            io.BytesIO(csv_data.encode("utf-8")),
            "text/csv",
        )
    }

    response = client.post("/api/datasets/upload", files=file_payload)
    assert response.status_code == 200

    data = response.json()
    assert "dataset_id" in data
    assert "analysis" in data

    analysis = data["analysis"]
    assert analysis["rows"] == 5
    assert analysis["columns"] == 4
    assert "column_profiles" in analysis
    assert len(analysis["column_profiles"]) == 4


def test_dataset_upload_invalid_file_type(client):
    """
    Tests that uploading an invalid file format (non-CSV) returns a bad request error.
    """
    file_payload = {
        "file": (
            "document.txt",
            io.BytesIO(b"Simple plain text file contents"),
            "text/plain",
        )
    }

    response = client.post("/api/datasets/upload", files=file_payload)
    # The application should raise a 400 Bad Request error for non-CSV files
    assert response.status_code == 400

    data = response.json()
    assert "detail" in data
