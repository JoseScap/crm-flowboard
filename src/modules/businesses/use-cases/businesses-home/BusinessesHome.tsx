import { BusinessesHomeProvider, useBusinessesHomeContext } from './BusinessesHomeContext';
import { BusinessesHomeHeader } from './components/BusinessesHomeHeader';
import { BusinessesHomeEmptyState } from './components/BusinessesHomeEmptyState';
import { BusinessesHomeGrid } from './components/BusinessesHomeGrid';
import { BusinessesHomeCreateDialog } from './components/BusinessesHomeCreateDialog';
import { BusinessesHomeEditDialog } from './components/BusinessesHomeEditDialog';
import { BusinessesHomeLoading } from './components/BusinessesHomeLoading';

const BusinessesHome = () => {
  const { loadingData } = useBusinessesHomeContext();

  if (loadingData) {
    return <BusinessesHomeLoading />;
  }

  return (
    <>
      <BusinessesHomeHeader />
      <BusinessesHomeEmptyState />
      <BusinessesHomeGrid />
      <BusinessesHomeCreateDialog />
      <BusinessesHomeEditDialog />
    </>
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

