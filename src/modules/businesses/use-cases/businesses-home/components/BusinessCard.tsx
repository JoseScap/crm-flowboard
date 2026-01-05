import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tables } from '@/modules/types/supabase.schema';
import { formatDate } from '@/lib/lead-utils';
import { useBusinessesHomeContext } from '../BusinessesHomeContext';

interface BusinessCardProps {
  business: Tables<'businesses'>;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const navigate = useNavigate();
  const { handleOpenEditBusiness } = useBusinessesHomeContext();

  return (
    <div
      onClick={() => navigate(`/user/businesses/${business.id}`)}
      className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group animate-fade-in relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          <Building2 className="w-6 h-6" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEditBusiness(business);
          }}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {business.name}
      </h3>
      
      {business.description && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {business.description}
        </p>
      )}
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(business.created_at)}</span>
      </div>
    </div>
  );
}

