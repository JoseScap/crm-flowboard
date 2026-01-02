import { BusinessesHomeProvider, useBusinessesHomeContext } from './BusinessesHomeContext';
import { BusinessesHomeHeader } from './components/BusinessesHomeHeader';
import { BusinessesHomeEmptyState } from './components/BusinessesHomeEmptyState';
import { BusinessesHomeGrid } from './components/BusinessesHomeGrid';
import { BusinessesHomeCreateDialog } from './components/BusinessesHomeCreateDialog';
import { BusinessesHomeLoading } from './components/BusinessesHomeLoading';

const BusinessesHome = () => {
  const { loadingData } = useBusinessesHomeContext();

  if (loadingData) {
    return <BusinessesHomeLoading />;
  }

  return (
    <div className="p-6 lg:p-8 h-full">
      <BusinessesHomeHeader />
      <BusinessesHomeEmptyState />
      <BusinessesHomeGrid />
      <BusinessesHomeCreateDialog />
    </div>
  );
};

const BusinessesHomePage = () => {
  return (
    <BusinessesHomeProvider>
      <BusinessesHome />
    </BusinessesHomeProvider>
  );
};

export default BusinessesHomePage;

