import { PipelinesConfigProvider, usePipelinesConfigContext } from './PipelinesConfigContext';
import { PipelinesConfigHeader } from './components/PipelinesConfigHeader';
import { PipelinesConfigLoading } from './components/PipelinesConfigLoading';
import { PipelinesConfigNotFound } from './components/PipelinesConfigNotFound';
import { PipelinesConfigWhatsAppSection } from './components/PipelinesConfigWhatsAppSection';

const PipelinesConfig = () => {
  const { loading, pipeline } = usePipelinesConfigContext();

  if (loading) {
    return <PipelinesConfigLoading />;
  }

  if (!pipeline) {
    return <PipelinesConfigNotFound />;
  }

  return (
    <>
      <PipelinesConfigHeader />
      <PipelinesConfigWhatsAppSection />
    </>
  );
};

const PipelinesConfigPage = () => {
  return (
    <PipelinesConfigProvider>
      <PipelinesConfig />
    </PipelinesConfigProvider>
  );
};

export default PipelinesConfigPage;

