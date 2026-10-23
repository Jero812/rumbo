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

export const SlightRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 20v-6a3 3 0 0 1 .9-2.1L17 4" />
    <path d="M11 4h6v6" />
  </Svg>
);

export const Heart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />
  </Svg>
);

export const ImageIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="M20.5 16l-5-5-8.5 8.5" />
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
    case 'slight-right':
      return <SlightRight {...p} />;
    case 'arrive':
      return <Pin {...p} />;
    default:
      return <ArrowUp {...p} />;
  }
}

export function Logo({ size = 40 }: { size?: number }) {
  return <img src={`${import.meta.env.BASE_URL}logo.png`} width={size} height={size} alt="" className="logo" />;
}
