import { useRef } from 'react';
import type { RouteStep } from '../data/route';
import { useParallax } from '../hooks/useParallax';
import { DirectionIcon, Pin } from './Icons';

function Chevron({ i }: { i: number }) {
  return (
    <svg className="ar-chev" viewBox="0 0 40 24" style={{ ['--i' as string]: i }} aria-hidden="true">
      <path d="M4 20L20 5l16 15" />
    </svg>
  );
}

const SIDE_LABEL = { left: 'Izquierda', right: 'Derecha', 'slight-right': 'Diagonal' } as const;

/**
 * Capa de "realidad aumentada": un camino de luz dibujado sobre el piso con
 * perspectiva CSS y un marcador flotante. No está anclado al espacio real;
 * solo se mueve con la inclinación del teléfono (parallax).
 */
export function ArOverlay({ step }: { step: RouteStep }) {
  const worldRef = useRef<HTMLDivElement>(null);
  useParallax(worldRef);
  const dir = step.direction;
  const isTurn = dir === 'left' || dir === 'right';
  const hasSign = isTurn || dir === 'slight-right';

  return (
    <div className="ar" aria-hidden="true">
      <div className="ar-world" ref={worldRef}>
        <div className="ar-floor">
          <div className={`ar-plane dir-${dir}`}>
            <div className="ar-strip ar-strip-main">
              {Array.from({ length: isTurn ? 5 : 7 }, (_, i) => (
                <Chevron key={i} i={i} />
              ))}
            </div>
            {isTurn && (
              <div className={`ar-strip ar-strip-turn to-${dir}`}>
                {Array.from({ length: 4 }, (_, i) => (
                  <Chevron key={i} i={i + 5} />
                ))}
              </div>
            )}
            {dir === 'arrive' && (
              <div className="ar-target">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>
        </div>

        <div className={`ar-marker marker-${dir}`}>
          {dir === 'arrive' ? (
            <>
              <div className="ar-pin">
                <Pin width={34} height={34} />
              </div>
              <div className="ar-tag is-dest">{step.landmark}</div>
            </>
          ) : hasSign ? (
            <>
              <div className="ar-sign">
                <DirectionIcon direction={dir} width={46} height={46} strokeWidth={2.6} />
                <span>{SIDE_LABEL[dir]}</span>
              </div>
              <div className="ar-stem" />
            </>
          ) : (
            <>
              <div className="ar-tag">
                <strong>{step.distance} m</strong>
                <span>{step.landmark}</span>
              </div>
              <div className="ar-stem" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
