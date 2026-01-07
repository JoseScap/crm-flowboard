import { useApplicationsHomeContext } from '../ApplicationsHomeContext';
import { ApplicationCard } from './ApplicationCard';
import { Tables } from '@/modules/types/supabase.schema';

export interface ApplicationMetadata {
  id: string;
  name: string;
  description: string;
  color: string;
  connection?: Tables<'business_employee_oauth_connections'>;
}

export function ApplicationsHomeGrid() {
  const { connections } = useApplicationsHomeContext();

  const availableApplications: ApplicationMetadata[] = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync your calendar events and schedule meetings directly from your CRM',
      color: 'bg-blue-500',
      connection: connections.find(c => c.application_id === 'google-calendar'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {availableApplications.map((app) => (
        <ApplicationCard key={app.id} application={app} />
      ))}
    </div>
  );
}

