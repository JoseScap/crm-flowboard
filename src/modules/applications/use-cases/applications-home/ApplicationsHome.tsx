import { ApplicationsHomeProvider, useApplicationsHomeContext } from './ApplicationsHomeContext';
import { ApplicationsHomeHeader } from './components/ApplicationsHomeHeader';
import { ApplicationsHomeGrid } from './components/ApplicationsHomeGrid';
import { ApplicationsHomeLoading } from './components/ApplicationsHomeLoading';
import { PipelineSelectorDialog } from './components/PipelineSelectorDialog';

const ApplicationsHome = () => {
  const { 
    loadingData, 
    pipelines,
    isPipelineSelectorDialogOpen,
    handleClosePipelineSelector,
    handleSelectPipeline 
  } = useApplicationsHomeContext();

  if (loadingData) {
    return <ApplicationsHomeLoading />;
  }

  return (
    <div className="p-6 lg:p-8 h-full">
      <ApplicationsHomeHeader />
      <ApplicationsHomeGrid />
      <PipelineSelectorDialog
        open={isPipelineSelectorDialogOpen}
        onOpenChange={handleClosePipelineSelector}
        pipelines={pipelines}
        onSelectPipeline={handleSelectPipeline}
      />
    </div>
  );
};

const ApplicationsHomePage = () => {
  return (
    <ApplicationsHomeProvider>
      <ApplicationsHome />
    </ApplicationsHomeProvider>
  );
};

export default ApplicationsHomePage;

