import { ApplicationsHomeProvider, useApplicationsHomeContext } from './ApplicationsHomeContext';
import { ApplicationsHomeHeader } from './components/ApplicationsHomeHeader';
import { ApplicationsHomeGrid } from './components/ApplicationsHomeGrid';
import { ApplicationsHomeLoading } from './components/ApplicationsHomeLoading';

const ApplicationsHome = () => {
  const { 
    loadingData, 
  } = useApplicationsHomeContext();

  if (loadingData) {
    return <ApplicationsHomeLoading />;
  }

  return (
    <div className="p-6 lg:p-8 h-full">
      <ApplicationsHomeGrid />
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

