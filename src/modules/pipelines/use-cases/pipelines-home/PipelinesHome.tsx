import { PipelinesHomeProvider, usePipelinesHomeContext } from './PipelinesHomeContext';
import { PipelinesHomeEmptyState } from './components/PipelinesHomeEmptyState';
import { PipelinesHomeGrid } from './components/PipelinesHomeGrid';
import { PipelinesHomeCreateDialog } from './components/PipelinesHomeCreateDialog';
import { PipelinesHomeLoading } from './components/PipelinesHomeLoading';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const PipelinesHome = () => {
  const { loadingData, handleCreatePipeline } = usePipelinesHomeContext();

  if (loadingData) {
    return <PipelinesHomeLoading />;
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-end mb-6">
          <Button onClick={handleCreatePipeline} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nuevo Pipeline
          </Button>
        </div>
      </div>
      <PipelinesHomeEmptyState />
      <PipelinesHomeGrid />
      <PipelinesHomeCreateDialog />
    </>
  );
};

const PipelinesHomePage = () => {
  return (
    <PipelinesHomeProvider>
      <PipelinesHome />
    </PipelinesHomeProvider>
  );
};

export default PipelinesHomePage;

