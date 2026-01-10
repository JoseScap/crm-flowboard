import { useNavigate } from 'react-router-dom';
import { Building2, FolderKanban, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBusinessesHomeContext, BusinessesWithCounts } from '../BusinessesHomeContext';

interface BusinessCardProps {
  business: BusinessesWithCounts;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const navigate = useNavigate();
  const { handleOpenEditBusiness } = useBusinessesHomeContext();

  return (
    <div
      onClick={() => navigate(`/user/businesses/${business.id}`)}
      className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group animate-fade-in relative flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {business.name}
          </h3>
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
      
      <div className="flex-1">
        {business.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {business.description}
          </p>
        )}
      </div>

      <div className="flex items-center pt-4 border-t border-border mt-auto gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FolderKanban className="w-6 h-6 text-blue-500" />
          <span className="font-medium text-foreground">{business.pipelines_count}</span>
          <span className="text-xs">{business.pipelines_count === 1 ? 'pipeline' : 'pipelines'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-6 h-6 text-emerald-500" />
          <span className="font-medium text-foreground">{business.leads_count}</span>
          <span className="text-xs">{business.leads_count === 1 ? 'lead' : 'leads'}</span>
        </div>
      </div>
    </div>
  );
}

