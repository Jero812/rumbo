import type { RouteStep } from '../data/route';

// Entorno de respaldo cuando no hay cámara: la foto del paso si existe,
// o un campus genérico dibujado con el horizonte alineado al de la capa AR.
export function SimScene({ step }: { step: RouteStep }) {
  if (step.photo) {
    return <img className="sim-photo" src={`${import.meta.env.BASE_URL}${step.photo}`} alt="" />;
  }

  return (
    <div className="sim" aria-hidden="true">
      <div className="sim-sky" />
      <svg className="sim-skyline" viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice">
        <g className="sim-far">
          <rect x="0" y="62" width="70" height="58" />
          <rect x="300" y="50" width="100" height="70" />
          <rect x="150" y="70" width="110" height="50" />
        </g>
        <g className="sim-near">
          <rect x="20" y="40" width="80" height="80" rx="2" />
          <rect x="290" y="30" width="90" height="90" rx="2" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`l${r}${c}`} className="sim-window" x={32 + c * 22} y={52 + r * 16} width="12" height="7" />
            )),
          )}
          {[0, 1, 2, 3, 4].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`r${r}${c}`} className="sim-window" x={304 + c * 25} y={42 + r * 15} width="13" height="7" />
            )),
          )}
        </g>
        <g className="sim-trees">
          <circle cx="125" cy="98" r="18" />
          <circle cx="145" cy="104" r="14" />
          <circle cx="262" cy="96" r="20" />
          <circle cx="240" cy="106" r="12" />
        </g>
      </svg>
      <div className="sim-ground">
        <div className="sim-grid" />
      </div>
    </div>
  );
}
