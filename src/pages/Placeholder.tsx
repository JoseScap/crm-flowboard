import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

const Placeholder = () => {
  const location = useLocation();
  const pageName = location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="bg-secondary/50 rounded-full p-6 mb-6">
        <Construction className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{pageName}</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Esta página estará disponible pronto. Utiliza la barra lateral para volver al Pipeline.
      </p>
    </div>
  );
};

export default Placeholder;
