import { useApplicationsHomeContext } from '../ApplicationsHomeContext';
import { ApplicationCard } from './ApplicationCard';

export function ApplicationsHomeGrid() {
  const { applications } = useApplicationsHomeContext();

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No applications available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.map((application) => (
        <ApplicationCard key={application.id} application={application} />
      ))}
    </div>
  );
}

