import type { SVGProps } from 'react';
import type { Direction } from '../data/route';

type IconProps = SVGProps<SVGSVGElement>;

function Svg(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export const ArrowUp = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20V5" />
    <path d="M6 11l6-6 6 6" />
  </Svg>
);

export const TurnRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 20v-7a4 4 0 0 1 4-4h8" />
    <path d="M15 5l4 4-4 4" />
  </Svg>
);

export const TurnLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M17 20v-7a4 4 0 0 0-4-4H5" />
    <path d="M9 5L5 9l4 4" />
  </Svg>
);

export const Pin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);

export const Close = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const MapIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </Svg>
);

export const Check = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const Clock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const Walk = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="13" cy="4.5" r="1.8" />
    <path d="M10 21l2-6-2.5-2.5L11 8l3 3 3 1" />
    <path d="M9.5 12.5L7 11l1.5-3.5" />
    <path d="M12 15l3 6" />
  </Svg>
);

export const Steps = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 18h4v-4h4v-4h4V6h4" />
  </Svg>
);

export const ChevronLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const ChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);

export const Locate = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="8" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
  </Svg>
);

export const Book = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" />
  </Svg>
);

export const Camera = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Svg>
);

export function DirectionIcon({ direction, ...p }: IconProps & { direction: Direction }) {
  switch (direction) {
    case 'left':
      return <TurnLeft {...p} />;
    case 'right':
      return <TurnRight {...p} />;
    case 'arrive':
      return <Pin {...p} />;
    default:
      return <ArrowUp {...p} />;
  }
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="rumbo-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38e8ff" />
          <stop offset="1" stopColor="#7b61ff" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="12" fill="#0d1527" stroke="url(#rumbo-logo)" strokeWidth="1.5" />
      <path d="M20 8l9 22-9-5-9 5z" fill="url(#rumbo-logo)" />
    </svg>
  );
}
