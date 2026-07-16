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
  /** light = fond clair (sidebar, formulaires) · dark = fond sombre (carousel, header vert) */
  variant?: 'light' | 'dark';
};

export function HomifyLogo({
  size = 'md',
  className,
  to,
  variant = 'light',
}: HomifyLogoProps) {
  const image = (
    <span className={cn('inline-flex shrink-0', className)}>
      <img
        src={homifyLogo}
        alt="Homify — Votre Escapade, Votre Maison"
        className={cn(
          'w-auto object-contain object-left select-none',
          SIZE_CLASS[size],
          variant === 'light' && 'mix-blend-multiply',
          variant === 'dark' && 'mix-blend-screen brightness-110 contrast-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]',
        )}
        draggable={false}
      />
    </span>
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
