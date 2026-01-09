import { LeadDetailsProvider, useLeadDetailsContext } from './LeadDetailsContext';
import { LeadDetailsSection } from './components/LeadDetailsSection';
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
          <h2 className="text-2xl font-semibold text-foreground mb-2">Lead no encontrado</h2>
          <p className="text-muted-foreground">El lead que buscas no existe o no tienes acceso a él.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 min-h-full">
      <LeadDetailsSection />
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

