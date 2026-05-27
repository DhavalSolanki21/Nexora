import os
import shutil
import tempfile
import pytest
from fastapi.testclient import TestClient

@pytest.fixture(scope="session", autouse=True)
def test_environment():
    """
    Sets up a isolated environment for the test execution session.
    Configures temporary folders for file uploads and enforces memory persistence.
    """
    # Create temporary directory for dataset uploads
    temp_upload_dir = tempfile.mkdtemp()
    
    # Save original environment values
    original_upload_dir = os.environ.get("UPLOAD_DIR")
    original_persistence = os.environ.get("PERSISTENCE_BACKEND")
    
    # Apply test overrides
    os.environ["UPLOAD_DIR"] = temp_upload_dir
    os.environ["PERSISTENCE_BACKEND"] = "local"
    
    yield
    
    # Restore original environment values
    if original_upload_dir is not None:
        os.environ["UPLOAD_DIR"] = original_upload_dir
    else:
        os.environ.pop("UPLOAD_DIR", None)
        
    if original_persistence is not None:
        os.environ["PERSISTENCE_BACKEND"] = original_persistence
    else:
        os.environ.pop("PERSISTENCE_BACKEND", None)
        
    # Delete temporary directory contents
    shutil.rmtree(temp_upload_dir, ignore_errors=True)

@pytest.fixture
def client():
    """
    Provides a FastAPI test client instance for request simulations.
    """
    # Import app inside fixture to ensure configuration overrides are picked up first
    from app.main import app
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def sample_csv():
    """
    Provides a helper function to generate small, valid CSV string contents for testing upload routers.
    """
    def _generate_csv(rows=5):
        header = "Hours_Studied,Attendance,Sleep_Hours,Exam_Score\n"
        data = [
            "4.5,85,7,72\n",
            "3.2,90,6,65\n",
            "5.0,95,8,88\n",
            "1.5,60,5,45\n",
            "6.2,92,7,95\n"
        ]
        return header + "".join(data[:rows])
    return _generate_csv
