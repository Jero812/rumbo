// Única ruta del prototipo. Todo el contenido de la navegación sale de aquí:
// para cambiar nombres, pasos, distancias o fotos, edita solo este archivo.

export type Direction = 'straight' | 'left' | 'right' | 'slight-right' | 'arrive';

/** Punto dentro de una foto, en fracciones de su ancho y alto (0–1). */
export interface PhotoPoint {
  x: number;
  y: number;
}

export interface RoutePhoto {
  /** Archivo dentro de public/, por ejemplo 'route/paso-1.jpg'. */
  src: string;
  /** Dónde termina el tramo dentro de la foto (la flecha azul de la guía). */
  target: PhotoPoint;
  /** Texto del marcador sobre el punto. */
  label: string;
}

export interface RouteStep {
  direction: Direction;
  /** Indicación corta, se lee de un vistazo. */
  title: string;
  /** Aclaración con una referencia visible del entorno. */
  detail: string;
  /** Metros aproximados de este tramo (0 = ya estás ahí). */
  distance: number;
  /** Referencia que aparece flotando en la vista AR. */
  landmark: string;
  /** Lo que se ve al empezar el tramo, con el punto hasta donde caminar. */
  photo: RoutePhoto;
  /** Foto extra del punto donde termina el tramo, si ayuda a reconocerlo. */
  checkpoint?: RoutePhoto & { caption: string };
}

export const ROUTE = {
  campus: 'Universidad Icesi',
  city: 'Cali, Colombia',
  origin: {
    name: 'Entrada principal',
    detail: 'Plazoleta frente al arco de ladrillo',
  },
  destination: {
    name: 'Bienestar Universitario',
    short: 'BU',
    detail: 'Edificio de Bienestar Universitario (BU)',
  },
  steps: [
    {
      direction: 'straight',
      title: 'Camina hacia la entrada',
      detail: 'Avanza recto hasta pasar bajo el arco de ladrillo.',
      distance: 18,
      landmark: 'Arco de la entrada',
      photo: { src: 'route/paso-1.jpg', target: { x: 0.514, y: 0.618 }, label: 'Pasa bajo el arco' },
    },
    {
      direction: 'right',
      title: 'Gira a la derecha',
      detail: 'Sigue la guía amarilla del piso hasta la puerta de vidrio.',
      distance: 14,
      landmark: 'Puerta de vidrio',
      photo: { src: 'route/paso-2.jpg', target: { x: 0.472, y: 0.564 }, label: 'Hasta la puerta' },
    },
    {
      direction: 'left',
      title: 'Gira a la izquierda',
      detail: 'Sigue la guía amarilla hasta el final del corredor.',
      distance: 27,
      landmark: 'Final del corredor',
      photo: { src: 'route/paso-3.jpg', target: { x: 0.525, y: 0.516 }, label: 'Hasta el final' },
    },
    {
      direction: 'slight-right',
      title: 'Avanza en diagonal a la derecha',
      detail: 'Cruza el hall siguiendo la guía amarilla, hasta la máquina.',
      distance: 9,
      landmark: 'Hall con escaleras',
      photo: { src: 'route/paso-4.jpg', target: { x: 0.554, y: 0.613 }, label: 'Hasta la máquina' },
    },
    {
      direction: 'left',
      title: 'Gira a la izquierda',
      detail: 'Desde la máquina, toma el corredor de las lámparas hasta el final.',
      distance: 21,
      landmark: 'Corredor de lámparas',
      photo: { src: 'route/paso-5.jpg', target: { x: 0.507, y: 0.496 }, label: 'Hasta la salida' },
    },
    {
      direction: 'right',
      title: 'Gira a la derecha',
      detail: 'Sigue por el corredor del Edificio B hasta el final.',
      distance: 33,
      landmark: 'Edificio B',
      photo: { src: 'route/paso-6.jpg', target: { x: 0.534, y: 0.523 }, label: 'Hasta el final' },
    },
    {
      direction: 'left',
      title: 'Gira a la izquierda',
      detail: 'Toma el sendero con árboles y mesas hasta el letrero de direcciones.',
      distance: 32,
      landmark: 'Letrero de direcciones',
      photo: { src: 'route/paso-7.jpg', target: { x: 0.474, y: 0.471 }, label: 'Hasta el letrero' },
      checkpoint: {
        src: 'route/letrero.jpg',
        target: { x: 0.42, y: 0.48 },
        label: 'Aquí, a la derecha',
        caption: 'Al llegar a este letrero, sigue a la derecha.',
      },
    },
    {
      direction: 'right',
      title: 'Gira a la derecha',
      detail: 'En el letrero, toma el camino junto al edificio de ladrillo.',
      distance: 21,
      landmark: 'Bienestar Universitario',
      photo: { src: 'route/paso-8.jpg', target: { x: 0.545, y: 0.47 }, label: 'Hasta la pantalla' },
    },
    {
      direction: 'arrive',
      title: 'Llegaste a Bienestar Universitario',
      detail: 'La entrada está frente a ti, bajo la pantalla grande.',
      distance: 0,
      landmark: 'Bienestar Universitario',
      photo: { src: 'route/llegada.jpg', target: { x: 0.565, y: 0.729 }, label: 'Entrada de BU' },
    },
  ] satisfies RouteStep[] as RouteStep[],
};

export const TOTAL_DISTANCE = ROUTE.steps.reduce((sum, s) => sum + s.distance, 0);

// Caminando a ~70 m por minuto.
export const TOTAL_MINUTES = Math.max(1, Math.round(TOTAL_DISTANCE / 70));

export const photoUrl = (src: string) => `${import.meta.env.BASE_URL}${src}`;

// ---------- Mapa esquemático ----------
// Se calcula solo a partir de los giros y distancias, así nunca se
// desincroniza de los pasos. Coordenadas en el viewBox 160 × 100.

const TURN: Record<Direction, number> = { straight: 0, left: -90, right: 90, 'slight-right': 45, arrive: 0 };

function buildPath() {
  let heading = 0;
  let x = 0;
  let y = 0;
  const raw = [{ x, y }];
  for (const step of ROUTE.steps) {
    if (step.distance === 0) continue;
    heading += TURN[step.direction];
    const rad = (heading * Math.PI) / 180;
    x += Math.sin(rad) * step.distance;
    y -= Math.cos(rad) * step.distance;
    raw.push({ x, y });
  }
  const xs = raw.map((p) => p.x);
  const ys = raw.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const pad = 14;
  const scale = Math.min((160 - pad * 2) / (maxX - minX || 1), (100 - pad * 2) / (maxY - minY || 1));
  const offX = (160 - (maxX - minX) * scale) / 2;
  const offY = (100 - (maxY - minY) * scale) / 2;
  return raw.map((p) => ({ x: offX + (p.x - minX) * scale, y: offY + (p.y - minY) * scale }));
}

/** Un punto al inicio de cada tramo con distancia, más el destino. */
export const MAP_PATH = buildPath();

/** Índice del punto del mapa donde está el usuario en el paso dado. */
export const mapIndexForStep = (stepIndex: number) => Math.min(stepIndex, MAP_PATH.length - 1);
