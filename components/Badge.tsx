import { CheckCircle, Users, FlaskConical, ScanLine, Package } from 'lucide-react';
import type { BadgeType } from '@/lib/types';

const config: Record<BadgeType, { label: string; className: string; Icon: React.ElementType }> = {
  verified: {
    label: 'Verified Fitment',
    className: 'badge-verified',
    Icon: CheckCircle,
  },
  community: {
    label: 'Community Tested',
    className: 'badge-community',
    Icon: Users,
  },
  prototype: {
    label: 'Prototype',
    className: 'badge-prototype',
    Icon: FlaskConical,
  },
  'scan-available': {
    label: 'Scan Available',
    className: 'badge-scan',
    Icon: ScanLine,
  },
  'part-available': {
    label: 'Part Available',
    className: 'badge-part',
    Icon: Package,
  },
};

interface BadgeProps {
  type: BadgeType;
  label?: string;
  size?: 'sm' | 'md';
}

export default function Badge({ type, label, size = 'sm' }: BadgeProps) {
  const { className, Icon, label: defaultLabel } = config[type];
  const text = label ?? defaultLabel;
  const padding = size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-2 py-0.5 text-[10px]';

  return (
    <span className={`inline-flex items-center gap-1 rounded font-semibold uppercase tracking-wider ${className} ${padding}`}>
      <Icon className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      {text}
    </span>
  );
}
