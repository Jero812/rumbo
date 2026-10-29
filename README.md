# Rumbo · Prototipo de navegación con AR

Prototipo web para pruebas de usabilidad en la Universidad Icesi. Tiene tres pantallas conectadas y una sola ruta fija:

1. **Seleccionar destino.** Muestra el punto de inicio, el destino, la distancia, el tiempo y el número de indicaciones.
2. **Navegación AR.** Usa la cámara trasera en vivo con un camino de luz sobre el piso, marcadores flotantes y una tarjeta con la indicación.
3. **Llegada.** Confirma el destino y muestra el tiempo. Permite finalizar o repetir el recorrido.

## Qué es real y qué está simulado

| Real | Aproximado o simulado |
|---|---|
| El video en vivo de la cámara trasera (con HTTPS) | El piso: el camino de luz se dibuja con perspectiva CSS, sin detectar superficies (no hay ARKit ni WebXR en Safari) |
| La posición GPS del teléfono y el avance automático al llegar a cada punto (`CHECKPOINTS` en `src/data/route.ts`) | La precisión: depende del GPS del teléfono (normalmente ±5–15 m, peor bajo techo) |
| La dirección de las flechas: rumbo GPS al siguiente punto menos la brújula del teléfono | El mapa, que es un esquema y no un plano a escala |
| El flujo completo y las transiciones | |

### Cómo avanza la navegación

- El teléfono sigue la ubicación con `watchPosition` y la compara con el punto donde termina el paso actual.
- Un punto se da por alcanzado con **2 lecturas seguidas** dentro de un radio de **6–12 m**, según la precisión del GPS, y nunca más del 60 % del tramo. Además deben pasar **3 s** en el paso, y la precisión debe ser de **±25 m o mejor**.
- El punto de partida no se valida: los facilitadores ubican a cada participante.
- El botón **Siguiente indicación** queda como respaldo si el GPS se atrasa.
- Si falta el permiso de ubicación o de brújula, la app lo avisa y sigue funcionando con el botón.

No hay backend ni cuentas. Si la cámara no está disponible o el usuario no da permiso, la app cambia sola a la **vista con fotos**: la foto real de cada tramo con el camino dibujado hasta el punto donde termina. El botón **Fotos** permite usarla a propósito, por ejemplo en una prueba dentro de un salón. En cualquier modo, la miniatura de la tarjeta abre la foto de referencia del tramo.

## Editar la ruta

Todo el contenido está en `src/data/route.ts`: los nombres del inicio y del destino, los pasos, las distancias y las referencias.

Para usar fotos reales en la vista simulada:
1. Copia las fotos verticales en `public/route/`.
2. En el paso, ajusta `photo.src` y `photo.target` (dónde termina el tramo dentro de la foto, de 0 a 1).

## Comandos (desde la carpeta `rumbo`)

```bash
npm install        # solo la primera vez
npm run dev        # servidor local; en el iPhone, usa la URL "Network" (misma Wi-Fi)
npm run build      # compila la versión de producción en dist/
```

En el iPhone, la cámara solo funciona con **HTTPS**. Por eso, en la red local (`http://192.168…`) se ve la vista simulada. Para probar la cámara, usa el enlace publicado.

## Publicación

Cada `git push` a la rama `main` publica la app en GitHub Pages con el flujo `.github/workflows/deploy.yml`. La dirección queda así: `https://<usuario>.github.io/<repositorio>/`.

Antes del primer push hay que activar Pages en el repositorio: **Settings → Pages → Source: GitHub Actions**.
