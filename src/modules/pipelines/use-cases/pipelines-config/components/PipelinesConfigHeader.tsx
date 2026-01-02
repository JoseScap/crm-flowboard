import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePipelinesConfigContext } from '../PipelinesConfigContext';
import { useParams, useNavigate } from 'react-router-dom';

export function PipelinesConfigHeader() {
  const { pipeline } = usePipelinesConfigContext();
  const { id: businessId, pipelineId } = useParams<{ id: string; pipelineId: string }>();
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/user/businesses/${businessId}/pipeline/${pipelineId}`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pipeline Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Configure settings for {pipeline?.name}
          </p>
        </div>
      </div>
    </div>
  );
}

