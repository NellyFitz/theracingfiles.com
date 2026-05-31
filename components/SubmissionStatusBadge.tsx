import { Clock, Eye, CheckCircle, XCircle } from 'lucide-react';
import type { SubmissionStatus } from '@/lib/supabase/db-types';

const config: Record<SubmissionStatus, { label: string; className: string; Icon: React.ElementType }> = {
  pending: {
    label: 'Pending Review',
    className: 'bg-amber-500/10 border border-amber-500/30 text-amber-400',
    Icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-blue-500/10 border border-blue-500/30 text-blue-400',
    Icon: Eye,
  },
  approved: {
    label: 'Approved',
    className: 'bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14]',
    Icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/10 border border-red-500/30 text-red-400',
    Icon: XCircle,
  },
};

export default function SubmissionStatusBadge({
  status,
  size = 'sm',
}: {
  status: SubmissionStatus;
  size?: 'sm' | 'md';
}) {
  const { label, className, Icon } = config[status];
  const padding = size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-2 py-0.5 text-[10px]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded font-semibold uppercase tracking-wider ${className} ${padding}`}>
      <Icon className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      {label}
    </span>
  );
}
