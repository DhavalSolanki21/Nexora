import io
from typing import BinaryIO

import pandas as pd

MAX_ROWS = 500_000
MAX_COLS = 500


class DatasetValidationError(Exception):
    def __init__(self, message: str, code: str = "validation_error"):
        self.message = message
        self.code = code
        super().__init__(message)


def load_csv(content: bytes, filename: str) -> pd.DataFrame:
    if not filename.lower().endswith(".csv"):
        raise DatasetValidationError("Only CSV files are supported.", "invalid_format")

    if len(content) == 0:
        raise DatasetValidationError("The uploaded file is empty.", "empty_file")

    for encoding in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
        try:
            df = pd.read_csv(io.BytesIO(content), encoding=encoding, low_memory=False)
            break
        except UnicodeDecodeError:
            continue
        except pd.errors.EmptyDataError:
            raise DatasetValidationError("The CSV file contains no data.", "empty_dataset")
        except pd.errors.ParserError as e:
            raise DatasetValidationError(f"Could not parse CSV: {e}", "parse_error")
    else:
        raise DatasetValidationError("Unsupported or corrupted file encoding.", "encoding_error")

    if df.empty or len(df.columns) == 0:
        raise DatasetValidationError("The dataset has no rows or columns.", "empty_dataset")

    if df.columns.duplicated().any():
        dupes = df.columns[df.columns.duplicated()].tolist()
        raise DatasetValidationError(
            f"Duplicate column headers found: {', '.join(map(str, dupes[:5]))}",
            "duplicate_headers",
        )

    unnamed = [c for c in df.columns if str(c).startswith("Unnamed")]
    if len(unnamed) == len(df.columns):
        raise DatasetValidationError("CSV appears to lack a valid header row.", "invalid_headers")

    if len(df) > MAX_ROWS:
        raise DatasetValidationError(
            f"Dataset exceeds maximum of {MAX_ROWS:,} rows.",
            "too_large",
        )

    if len(df.columns) > MAX_COLS:
        raise DatasetValidationError(
            f"Dataset exceeds maximum of {MAX_COLS} columns.",
            "too_many_columns",
        )

    df.columns = [str(c).strip() for c in df.columns]
    return df


def save_to_buffer(df: pd.DataFrame) -> bytes:
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    return buf.getvalue()
