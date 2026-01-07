import { BusinessViewProvider, useBusinessViewContext } from './BusinessViewContext';
import { BusinessViewLoading } from './components/BusinessViewLoading';
import { BusinessViewNotFound } from './components/BusinessViewNotFound';
import { BusinessViewStatsCards } from './components/BusinessViewStatsCards';
import { BusinessViewAdditionalStats } from './components/BusinessViewAdditionalStats';
import { BusinessViewEmployeesTable } from './components/BusinessViewEmployeesTable';
import { BusinessViewDialogs } from './components/BusinessViewDialogs';

const BusinessView = () => {
  const { loading, business } = useBusinessViewContext();

  if (loading) {
    return <BusinessViewLoading />;
  }

  if (!business) {
    return <BusinessViewNotFound />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <BusinessViewStatsCards />
      <BusinessViewAdditionalStats />
      <BusinessViewEmployeesTable />
      <BusinessViewDialogs />
    </div>
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
