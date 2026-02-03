"""
EP Keycap Generator API
=======================
FastAPI server for generating 3D printable keycap STLs.
"""

import os
import io
import zipfile
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from generator.stl_generator import generate_keycap, get_available_fonts

app = FastAPI(
    title="EP Keycap Generator API",
    description="Generate 3D printable keycaps for Teenage Engineering EP-series",
    version="1.0.0"
)

# CORS - allow requests from Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
        os.getenv("CORS_ORIGINS", "*"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
FONTS_DIR = os.path.join(ASSETS_DIR, "fonts")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(FONTS_DIR, exist_ok=True)


class KeycapConfig(BaseModel):
    id: int
    char: str
    size: float = 12.0


class GenerateRequest(BaseModel):
    keycaps: List[KeycapConfig]
    font: str = "digitalix.ttf"
    engrave_depth: float = 0.8
    default_size: float = 12.0


@app.get("/")
async def root():
    """Health check."""
    return {
        "status": "ok",
        "service": "EP Keycap Generator API",
        "version": "1.0.0"
    }


@app.get("/fonts")
async def list_fonts():
    """List available fonts."""
    fonts = []

    # Check assets/fonts
    if os.path.exists(FONTS_DIR):
        for f in os.listdir(FONTS_DIR):
            if f.lower().endswith(('.ttf', '.otf')):
                fonts.append(f)

    # Check uploads
    if os.path.exists(UPLOADS_DIR):
        for f in os.listdir(UPLOADS_DIR):
            if f.lower().endswith(('.ttf', '.otf')):
                fonts.append(f)

    return {"fonts": list(set(fonts))}  # Remove duplicates


@app.post("/fonts")
async def upload_font(file: UploadFile = File(...)):
    """Upload a TTF/OTF font file."""
    if not file.filename.lower().endswith(('.ttf', '.otf')):
        raise HTTPException(400, "Only .ttf and .otf files allowed")

    filepath = os.path.join(UPLOADS_DIR, file.filename)
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    return {"status": "uploaded", "filename": file.filename}


@app.post("/generate")
async def generate_keycaps(request: GenerateRequest):
    """
    Generate all keycap STLs and return as ZIP.
    """
    # Find font file
    font_path = None
    for search_dir in [FONTS_DIR, UPLOADS_DIR]:
        potential_path = os.path.join(search_dir, request.font)
        if os.path.exists(potential_path):
            font_path = potential_path
            break

    if not font_path:
        raise HTTPException(404, f"Font not found: {request.font}")

    # Get base keycap STL
    base_stl_path = os.path.join(ASSETS_DIR, "ep133_keycap.stl")
    if not os.path.exists(base_stl_path):
        raise HTTPException(500, "Base keycap STL not found")

    # Create ZIP in memory
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        for keycap in request.keycaps:
            try:
                # Generate STL for this keycap
                stl_data = generate_keycap(
                    base_stl_path=base_stl_path,
                    font_path=font_path,
                    char=keycap.char,
                    text_size=keycap.size,
                    engrave_depth=request.engrave_depth
                )

                if stl_data:
                    # Add to ZIP
                    filename = f"keycap_{keycap.id:02d}_{keycap.char}.stl"
                    # Sanitize filename
                    filename = filename.replace('+', 'plus').replace('-', 'minus')
                    zf.writestr(filename, stl_data)

            except Exception as e:
                print(f"Error generating keycap {keycap.char}: {e}")
                continue

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=keycaps.zip"}
    )


@app.get("/generate/{char}")
async def generate_single(
    char: str,
    font: str = "digitalix.ttf",
    size: float = 12.0,
    depth: float = 0.8
):
    """Generate a single keycap STL."""
    # Find font
    font_path = None
    for search_dir in [FONTS_DIR, UPLOADS_DIR]:
        potential_path = os.path.join(search_dir, font)
        if os.path.exists(potential_path):
            font_path = potential_path
            break

    if not font_path:
        raise HTTPException(404, f"Font not found: {font}")

    base_stl_path = os.path.join(ASSETS_DIR, "ep133_keycap.stl")

    try:
        stl_data = generate_keycap(
            base_stl_path=base_stl_path,
            font_path=font_path,
            char=char,
            text_size=size,
            engrave_depth=depth
        )

        if stl_data:
            return StreamingResponse(
                io.BytesIO(stl_data),
                media_type="application/octet-stream",
                headers={"Content-Disposition": f"attachment; filename=keycap_{char}.stl"}
            )
        else:
            raise HTTPException(500, "Failed to generate STL")

    except Exception as e:
        raise HTTPException(500, str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
