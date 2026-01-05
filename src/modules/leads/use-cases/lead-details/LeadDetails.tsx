import { LeadDetailsProvider, useLeadDetailsContext } from './LeadDetailsContext';
import { LeadDetailsCard } from './components/LeadDetailsCard';
import { LeadDetailsLoading } from './components/LeadDetailsLoading';

const LeadDetails = () => {
  const { loadingData, lead } = useLeadDetailsContext();

  if (loadingData) {
    return <LeadDetailsLoading />;
  }

  if (!lead) {
    return (
      <div className="p-6 lg:p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Lead not found</h2>
          <p className="text-muted-foreground">The lead you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 h-full">
      <LeadDetailsCard />
    </div>
  );
};

const LeadDetailsPage = () => {
  return (
    <LeadDetailsProvider>
      <LeadDetails />
    </LeadDetailsProvider>
  );
};

export default LeadDetailsPage;

