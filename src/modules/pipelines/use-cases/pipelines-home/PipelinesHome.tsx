import { PipelinesHomeProvider, usePipelinesHomeContext } from './PipelinesHomeContext';
import { PipelinesHomeHeader } from './components/PipelinesHomeHeader';
import { PipelinesHomeEmptyState } from './components/PipelinesHomeEmptyState';
import { PipelinesHomeGrid } from './components/PipelinesHomeGrid';
import { PipelinesHomeCreateDialog } from './components/PipelinesHomeCreateDialog';
import { PipelinesHomeLoading } from './components/PipelinesHomeLoading';

const PipelinesHome = () => {
  const { loadingData } = usePipelinesHomeContext();

  if (loadingData) {
    return <PipelinesHomeLoading />;
  }

  return (
    <div className="p-6 lg:p-8 h-full">
      <PipelinesHomeHeader />
      <PipelinesHomeEmptyState />
      <PipelinesHomeGrid />
      <PipelinesHomeCreateDialog />
    </div>
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

