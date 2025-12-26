import { usePipelinesHomeContext } from '../PipelinesHomeContext';
import { PipelineCard } from './PipelineCard';

export function PipelinesHomeGrid() {
  const { pipelines } = usePipelinesHomeContext();

  if (pipelines.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {pipelines.map((pipeline) => (
        <PipelineCard key={pipeline.id} pipeline={pipeline} />
      ))}
    </div>
  );
}

