import { BusinessViewProvider, useBusinessViewContext } from './BusinessViewContext';
import { BusinessViewLoading } from './components/BusinessViewLoading';
import { BusinessViewNotFound } from './components/BusinessViewNotFound';
import { BusinessViewStatsCards } from './components/BusinessViewStatsCards';
import { BusinessViewAdditionalStats } from './components/BusinessViewAdditionalStats';
import { BusinessViewEmployeesTable } from './components/BusinessViewEmployeesTable';
import { BusinessViewDialogs } from './components/BusinessViewDialogs';
import { BusinessViewDangerZone } from './components/BusinessViewDangerZone';

const BusinessView = () => {
  const { loading, business } = useBusinessViewContext();

  if (loading) {
    return <BusinessViewLoading />;
  }

  if (!business) {
    return <BusinessViewNotFound />;
  }

  return (
    <>
      <BusinessViewStatsCards />
      <BusinessViewAdditionalStats />
      <BusinessViewEmployeesTable />
      <BusinessViewDangerZone />
      <BusinessViewDialogs />
    </>
  );
};

const BusinessViewPage = () => {
  return (
    <BusinessViewProvider>
      <BusinessView />
    </BusinessViewProvider>
  );
};

export default BusinessViewPage;
