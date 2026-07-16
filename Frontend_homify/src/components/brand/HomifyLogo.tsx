import { Link } from 'react-router-dom';
import homifyLogo from '@/assets/homify.png';
import { cn } from '@/lib/utils';

const SIZE_CLASS = {
  xs: 'h-8',
  sm: 'h-10',
  md: 'h-14',
  lg: 'h-20',
  xl: 'h-28',
} as const;

type HomifyLogoProps = {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  to?: string;
  onDark?: boolean;
};

export function HomifyLogo({ size = 'md', className, to, onDark = false }: HomifyLogoProps) {
  const image = (
    <img
      src={homifyLogo}
      alt="Homify — Votre Escapade, Votre Maison"
      className={cn(
        'w-auto object-contain object-left select-none',
        SIZE_CLASS[size],
        onDark && 'rounded-lg bg-white/95 px-1.5 py-0.5 shadow-sm',
        className,
      )}
      draggable={false}
    />
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex shrink-0" aria-label="Homify">
        {image}
      </Link>
    );
  }

  return image;
}
