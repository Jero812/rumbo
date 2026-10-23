# Rumbo · Prototipo de navegación con AR

Prototipo web para pruebas de usabilidad en la Universidad Icesi. Tiene tres pantallas conectadas y una sola ruta fija:

1. **Seleccionar destino.** Muestra el punto de inicio, el destino, la distancia, el tiempo y el número de indicaciones.
2. **Navegación AR.** Usa la cámara trasera en vivo con un camino de luz sobre el piso, marcadores flotantes y una tarjeta con la indicación.
3. **Llegada.** Confirma el destino y muestra el tiempo. Permite finalizar o repetir el recorrido.

## Qué es real y qué está simulado

| Real | Simulado |
|---|---|
| El video en vivo de la cámara trasera (con HTTPS) | La posición del usuario: avanza cuando toca *Siguiente indicación* |
| El movimiento de las flechas con la inclinación del teléfono (giroscopio, parallax) | El anclaje de las flechas al piso: se dibujan con perspectiva CSS, sin detectar superficies |
| El flujo completo y las transiciones | El mapa, que es un esquema y no un plano a escala |

No hay GPS, ARKit, WebXR, backend ni cuentas. Si la cámara no está disponible o el usuario no da permiso, la app cambia sola a la **vista simulada**: muestra una foto del punto o un entorno dibujado. El botón **Simulada** permite usarla a propósito, por ejemplo en una prueba dentro de un salón.

## Editar la ruta

Todo el contenido está en `src/data/route.ts`: los nombres del inicio y del destino, los pasos, las distancias y las referencias.

Para usar fotos reales en la vista simulada:
1. Copia las fotos verticales en `public/route/`.
2. Agrega `photo: 'route/paso-1.jpg'` al paso correspondiente.

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
