import { Deal } from '@/types/crm';
import { Building2, DollarSign, Mail } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-primary',
    'bg-success',
    'bg-warning',
    'bg-destructive',
    'bg-muted',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export function DealCard({ deal }: DealCardProps) {
  return (
    <div className="bg-card rounded-lg p-4 shadow-lg border border-border hover:border-primary/50 transition-all duration-200 cursor-grab active:cursor-grabbing group">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${getAvatarColor(deal.name)} text-primary-foreground flex-shrink-0`}
        >
          {getInitials(deal.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {deal.name}
          </h4>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{deal.company}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-primary font-semibold">
          <DollarSign className="w-4 h-4" />
          <span>{formatCurrency(deal.value)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Mail className="w-3.5 h-3.5" />
          <span className="truncate max-w-[100px]">{deal.email}</span>
        </div>
      </div>
    </div>
  );
}
