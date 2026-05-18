"""
STL Generator
=============
Pure Python STL generation for keycaps with engraved text.
No Blender required!
"""

import os
import io
import numpy as np
import trimesh
import freetype
from shapely.geometry import Polygon
from shapely.ops import unary_union


def get_available_fonts(fonts_dir: str) -> list:
    """List available font files."""
    fonts = []
    if os.path.exists(fonts_dir):
        for f in os.listdir(fonts_dir):
            if f.lower().endswith(('.ttf', '.otf')):
                fonts.append(f)
    return fonts


def get_glyph_outline(font_path: str, char: str, size: float = 12.0) -> list:
    """
    Extract glyph outline as contours from a TTF font.
    Returns list of contours, each is a list of (x, y) points.
    """
    face = freetype.Face(font_path)
    face.set_char_size(int(size * 64 * 64))

    face.load_char(char, freetype.FT_LOAD_NO_BITMAP)
    outline = face.glyph.outline

    contours = []
    start = 0

    for end in outline.contours:
        points = []
        coords = outline.points[start:end + 1]

        for x, y in coords:
            points.append((x / 64.0, y / 64.0))

        if len(points) >= 3:
            contours.append(points)
        start = end + 1

    return contours


def contours_to_polygon(contours: list) -> Polygon:
    """Convert font contours to a Shapely polygon, handling holes."""
    if not contours:
        return None

    polygons = []
    for contour in contours:
        if len(contour) >= 3:
            try:
                poly = Polygon(contour)
                if poly.is_valid and poly.area > 0:
                    polygons.append(poly)
            except:
                pass

    if not polygons:
        return None

    # Sort by area (largest = exterior)
    polygons.sort(key=lambda p: p.area, reverse=True)

    # Largest is exterior, rest inside are holes
    exterior = polygons[0]
    holes = [p for p in polygons[1:] if exterior.contains(p)]

    if holes:
        result = exterior
        for hole in holes:
            result = result.difference(hole)
        return result

    return exterior


def text_to_mesh(font_path: str, char: str, size: float = 12.0,
                 height: float = 1.0, mirror_x: bool = True) -> trimesh.Trimesh:
    """Convert a character to a 3D mesh."""
    contours = get_glyph_outline(font_path, char, size)

    if not contours:
        print(f"No contours for '{char}'")
        return None

    # Mirror X for bottom engravings
    if mirror_x:
        contours = [[(-x, y) for x, y in c] for c in contours]

    polygon = contours_to_polygon(contours)

    if polygon is None or polygon.is_empty:
        print(f"No polygon for '{char}'")
        return None

    # Center the polygon
    centroid = polygon.centroid
    try:
        exterior_coords = list(polygon.exterior.coords)
        centered = Polygon([(x - centroid.x, y - centroid.y) for x, y in exterior_coords])

        # Extrude to 3D
        mesh = trimesh.creation.extrude_polygon(centered, height)
        return mesh
    except Exception as e:
        print(f"Extrusion failed for '{char}': {e}")
        return None


def generate_keycap(base_stl_path: str, font_path: str, char: str,
                    text_size: float = 10.0, engrave_depth: float = 0.8,
                    offset_x: float = 0.0, offset_y: float = 0.0) -> bytes:
    """
    Generate a keycap STL with engraved character.

    Args:
        base_stl_path: Path to base keycap STL
        font_path: Path to TTF/OTF font
        char: Character to engrave
        text_size: Size of text in mm
        engrave_depth: Depth of engraving in mm
        offset_x: Manual X offset for centering (mm)
        offset_y: Manual Y offset for centering (mm)

    Returns: STL file as bytes, or None on failure
    """
    # Load base keycap
    try:
        base_mesh = trimesh.load(base_stl_path)
    except Exception as e:
        print(f"Failed to load base STL: {e}")
        return None

    # Get keycap bounds
    bounds = base_mesh.bounds
    center_x = (bounds[0][0] + bounds[1][0]) / 2
    center_y = (bounds[0][1] + bounds[1][1]) / 2
    min_z = bounds[0][2]

    # Create text cutter
    cutter = text_to_mesh(
        font_path=font_path,
        char=char,
        size=text_size,
        height=engrave_depth + 0.5,
        mirror_x=True
    )

    if cutter is None:
        # Return base mesh without engraving if text fails
        buffer = io.BytesIO()
        base_mesh.export(buffer, file_type='stl')
        return buffer.getvalue()

    # Position cutter at bottom of keycap, with manual offset applied
    cutter.apply_translation([
        center_x + offset_x,
        center_y + offset_y,
        min_z - 0.1
    ])

    # Boolean difference
    try:
        # Try manifold engine first (fastest)
        result = base_mesh.difference(cutter, engine='manifold')
    except:
        try:
            # Fallback to blender if available
            result = base_mesh.difference(cutter, engine='blender')
        except:
            try:
                # Last resort
                result = base_mesh.difference(cutter)
            except Exception as e:
                print(f"Boolean failed for '{char}': {e}")
                # Return base mesh
                buffer = io.BytesIO()
                base_mesh.export(buffer, file_type='stl')
                return buffer.getvalue()

    # Export to bytes
    buffer = io.BytesIO()
    result.export(buffer, file_type='stl')
    return buffer.getvalue()


# Test
if __name__ == "__main__":
    import sys

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    BASE_STL = os.path.join(BASE_DIR, "assets", "ep133_keycap.stl")
    FONT = os.path.join(BASE_DIR, "assets", "fonts", "digitalix.ttf")

    print(f"Base STL: {BASE_STL}")
    print(f"Font: {FONT}")

    if os.path.exists(BASE_STL) and os.path.exists(FONT):
        data = generate_keycap(BASE_STL, FONT, "5", 10.0, 0.8, 0.0, 0.0)
        if data:
            with open("test_keycap_5.stl", "wb") as f:
                f.write(data)
            print("Saved test_keycap_5.stl")
        else:
            print("Generation failed")
    else:
        print("Missing files")
