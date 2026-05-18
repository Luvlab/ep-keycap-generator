# EP Keycap Generator

Generate 3D printable keycaps for Teenage Engineering EP-series (EP-133, EP-1320, EP-2350).

**Live Demo:** https://ep-keycap-generator.vercel.app

## Features

- Customize 20 keycaps with any character
- Upload custom TTF/OTF fonts
- Adjust text size and engrave depth
- Download ZIP with all STL files
- Pure Python STL generation (no Blender required)

## Architecture

```
frontend/     # React + Vite (Vercel)
api/          # Python FastAPI (Railway)
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Backend API

```bash
cd api
pip install -r requirements.txt
python main.py
```

API runs at http://localhost:8000

### Environment Variables

**Frontend (.env):**
```
VITE_API_URL=http://localhost:8000
```

**Backend:**
```
PORT=8000
CORS_ORIGINS=http://localhost:5173
```

## Deployment

### Vercel (Frontend)

1. Connect repo to Vercel
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env: `VITE_API_URL=<your-railway-url>`

### Railway (Backend)

1. Create new Railway project
2. Connect repo
3. Set root directory: `api`
4. Add env: `CORS_ORIGINS=<your-vercel-url>`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/fonts` | List available fonts |
| POST | `/fonts` | Upload font file |
| POST | `/generate` | Generate all keycaps (ZIP) |
| GET | `/generate/{char}` | Generate single keycap |

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS

**Backend:**
- FastAPI
- trimesh (3D mesh operations)
- freetype-py (font parsing)
- numpy-stl

## For EP-Series Machines

Works with:
- EP-133 KO II
- EP-1320 Medieval
- EP-2350 Choral

## License

MIT
