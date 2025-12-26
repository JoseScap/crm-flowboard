import { PipelineViewProvider, usePipelineViewContext } from './PipelineViewContext';
import { PipelineViewHeader } from './components/PipelineViewHeader';
import { PipelineViewKanbanBoard } from './components/PipelineViewKanbanBoard';
import { PipelineViewDialogs } from './components/PipelineViewDialogs';

const PipelineView = () => {
  return (
    <div className="p-6 lg:p-8 h-full">
      <PipelineViewHeader />
      <PipelineViewKanbanBoard />
      <PipelineViewDialogs />
    </div>
  );
};

const PipelineViewPage = () => {
  return (
    <PipelineViewProvider>
      <PipelineView />
    </PipelineViewProvider>
  );
};

export default PipelineViewPage;