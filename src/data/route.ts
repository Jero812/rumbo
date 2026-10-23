// Única ruta del prototipo. Todo el contenido de la navegación sale de aquí:
// para cambiar nombres, pasos, distancias o fotos, edita solo este archivo.

export type Direction = 'straight' | 'left' | 'right' | 'arrive';

export interface RouteStep {
  direction: Direction;
  /** Indicación corta, se lee de un vistazo. */
  title: string;
  /** Aclaración con una referencia visible del entorno. */
  detail: string;
  /** Metros aproximados de este tramo. */
  distance: number;
  /** Referencia que aparece flotando en la vista AR. */
  landmark: string;
  /**
   * Foto del punto (vista simulada). Archivo dentro de public/route/,
   * por ejemplo 'route/paso-1.jpg'. Si no hay foto se dibuja un entorno genérico.
   */
  photo?: string;
}

export interface MapPoint {
  x: number;
  y: number;
}

// PENDIENTE: reemplazar con los nombres reales del inicio, el destino y los pasos.
export const ROUTE = {
  campus: 'Universidad Icesi',
  city: 'Cali, Colombia',
  origin: {
    name: 'Entrada principal',
    detail: 'Portería peatonal',
  },
  destination: {
    name: 'Biblioteca',
    detail: 'Biblioteca central · Primer piso',
    category: 'Estudio',
  },
  steps: [
    {
      direction: 'straight',
      title: 'Sigue recto',
      detail: 'Avanza por el sendero principal hasta la plazoleta.',
      distance: 60,
      landmark: 'Plazoleta central',
    },
    {
      direction: 'right',
      title: 'Gira a la derecha',
      detail: 'En la plazoleta toma el camino de la derecha.',
      distance: 40,
      landmark: 'Camino cubierto',
    },
    {
      direction: 'straight',
      title: 'Continúa recto',
      detail: 'Sigue por el camino cubierto, pasando junto a la cafetería.',
      distance: 50,
      landmark: 'Cafetería',
    },
    {
      direction: 'left',
      title: 'Gira a la izquierda',
      detail: 'Al final del camino cubierto, gira hacia el edificio.',
      distance: 25,
      landmark: 'Entrada del edificio',
    },
    {
      direction: 'arrive',
      title: 'Tu destino está al frente',
      detail: 'Entra por la puerta principal: ya llegaste.',
      distance: 10,
      landmark: 'Biblioteca',
    },
  ] satisfies RouteStep[] as RouteStep[],
  // Puntos del mapa simplificado (viewBox 160 × 100): uno al inicio de cada
  // paso y uno final en el destino, así que hay steps.length + 1 puntos.
  path: [
    { x: 24, y: 88 },
    { x: 24, y: 52 },
    { x: 76, y: 52 },
    { x: 118, y: 52 },
    { x: 118, y: 22 },
    { x: 118, y: 12 },
  ] satisfies MapPoint[] as MapPoint[],
};

export const TOTAL_DISTANCE = ROUTE.steps.reduce((sum, s) => sum + s.distance, 0);

// Caminando a ~70 m por minuto.
export const TOTAL_MINUTES = Math.max(1, Math.round(TOTAL_DISTANCE / 70));
