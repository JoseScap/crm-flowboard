import { useNavigate, useParams } from 'react-router-dom';
import { DollarSign, Mail, Archive, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, getInitials, getAvatarColor } from '@/lib/deal-utils';
import { Tables } from '@/modules/types/supabase.schema';

interface DealCardProps {
  deal: Tables<'pipeline_stage_deals'>;
  onArchiveClick?: () => void;
  onDetailClick?: () => void;
}

export function DealCard({ deal, onArchiveClick, onDetailClick }: DealCardProps) {
  const navigate = useNavigate();
  const { id: businessIdParam } = useParams<{ id: string }>();
  // Use businessId from URL params, or fallback to deal.business_id
  const businessId = businessIdParam || deal.business_id.toString();

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/user/businesses/${businessId}/deal/${deal.id}`);
  };

  return (
    <div 
      className="bg-card rounded-lg p-4 shadow-lg border border-border hover:border-primary/50 transition-all duration-200 cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${getAvatarColor(deal.customer_name)} text-primary-foreground flex-shrink-0`}
        >
          {getInitials(deal.customer_name)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {deal.customer_name}
          </h4>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-primary font-semibold">
          <DollarSign className="w-4 h-4" />
          <span>{formatCurrency(deal.value)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{deal.email || 'N/A'}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-primary transition-colors [&:hover_svg]:text-primary-foreground"
            onClick={handleDetailClick}
          >
            <Eye className="w-3.5 h-3.5 text-primary transition-colors" />
          </Button>
          {onArchiveClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-destructive transition-colors [&:hover_svg]:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onArchiveClick();
              }}
            >
              <Archive className="w-3.5 h-3.5 text-destructive transition-colors" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
