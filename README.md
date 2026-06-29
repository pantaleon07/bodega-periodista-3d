# Bodega Col. Periodista — Visualizador 3D (400 m²)

Aplicación web 3D interactiva de una bodega de **400 m²** (Col. Periodista, Oaxaca),
recorrible en **primera persona** y con **vista exterior en órbita**, con un camión
convencional (estilo International eMV) arrimado al portón de descarga.

Medidas exactas según plano (huella 20×20 m, bóveda de cañón alero 3.50 / caballete 7.50,
portón 4.55×4.5 m). Incluye anaqueles, flujo de descarga, cajón exclusivo del tortón,
acotaciones, regla de medición y áreas (m²) por zona.

## Stack
Vite · React + TypeScript · three.js · @react-three/fiber · drei · postprocessing · zustand · leva

## Desarrollo
```bash
npm install
npm run dev      # http://localhost:5173
```

## Build de producción
```bash
npm run build    # genera dist/ (estático, rutas relativas)
```

## Despliegue
Estático puro (sin backend). Conectado a Netlify con auto-deploy: cada `push` a `main`
recompila y publica. La fuente única de medidas está en `src/constants/dims.ts`.
