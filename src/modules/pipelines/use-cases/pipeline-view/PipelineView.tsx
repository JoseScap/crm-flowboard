import { PipelineViewProvider, usePipelineViewContext } from './PipelineViewContext';
import { PipelineViewHeader } from './components/PipelineViewHeader';
import { PipelineViewKanbanBoard } from './components/PipelineViewKanbanBoard';
import { PipelineViewDialogs } from './components/PipelineViewDialogs';

const PipelineView = () => {
  return (
    <>
      <PipelineViewHeader />
      <PipelineViewKanbanBoard />
      <PipelineViewDialogs />
    </>
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