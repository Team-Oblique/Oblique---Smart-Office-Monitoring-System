"""
Thin run-script — lets the team start the server with `python main.py`
in addition to the usual `uvicorn app.main:app --reload`. The actual
FastAPI `app` object lives in app/main.py, not here.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)