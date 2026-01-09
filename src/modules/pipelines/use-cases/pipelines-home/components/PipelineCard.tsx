import { useNavigate, useParams } from 'react-router-dom';
import { FolderKanban, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tables } from '@/modules/types/supabase.schema';
import { formatDate } from '@/lib/lead-utils';

interface PipelineCardProps {
  pipeline: Tables<'pipelines'>;
}

export function PipelineCard({ pipeline }: PipelineCardProps) {
  const navigate = useNavigate();
  const { id: businessId } = useParams<{ id: string }>();

  return (
    <div
      onClick={() => navigate(`/user/businesses/${businessId}/pipeline/${pipeline.id}`)}
      className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group animate-fade-in relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          <FolderKanban className="w-6 h-6" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/user/businesses/${businessId}/pipeline/${pipeline.id}/config`);
          }}
          title="Configuración del Pipeline"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {pipeline.name}
      </h3>
      
      {pipeline.description && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {pipeline.description}
        </p>
      )}
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(pipeline.created_at)}</span>
      </div>
    </div>
  );
}

