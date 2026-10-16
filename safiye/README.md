# Safiye · The Videogame

Juego web en tiempo real hecho como regalo para Safiye: clínicas veterinarias en Stuttgart, Estambul y Barcelona (dirigida por Emilio), un Porsche 911 para moverse y Alejandro en casa esperando masajes y chuletones.

- **Jugar:** https://safiye-the-videogame.netlify.app (código de acceso: el modelo del Porsche)
- **Stack:** Three.js + Vite, compilado a un único `index.html` (`vite-plugin-singlefile`). Sin backend: la partida se guarda en `localStorage`.
- **Base:** rigs procedurales y paleta inspirados en `web-kitchen-rush/` de este repo; materiales Liquid Glass de `indaloholding/apple-design`.

```bash
cd safiye
npm install
npm run dev     # desarrollo
npm run build   # genera dist/ (lo que se publica en Netlify)
```

## Estructura
- `src/state.js` — simulación en tiempo real (llegadas, plazos, revisiones, muertes, Emilio, felicidad de Alejandro), también con el juego cerrado.
- `src/data.js` — casos clínicos, tratamientos, comidas, mejoras y clínicas.
- `src/house.js` — la casa de Stuttgart según el plano a mano (jardín, cristaleras, salón, habitación, baño).
- `src/clinic.js` — las tres clínicas con su decorado (Fernsehturm, mezquita y Gálata, Sagrada Familia).
- `src/drive.js` — viajes en Porsche 911.
- `src/models.js` — modelos procedurales (personas, gatos, elefante, jirafa, loro, león, Porsche).
- `src/legal.js` — aviso legal, privacidad, cookies y términos (Indalo Holding).
