import { useBusinessesHomeContext } from '../BusinessesHomeContext';
import { BusinessCard } from './BusinessCard';

export function BusinessesHomeGrid() {
  const { businesses } = useBusinessesHomeContext();

  if (businesses.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {businesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
}

