import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useLayoutContext } from './LayoutContext';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import supabase from '@/modules/common/lib/supabase';
import { Tables } from '@/modules/types/supabase.schema';
import { toast } from 'sonner';

interface BusinessLayoutProps {
  children: ReactNode;
  maxHeightScreen?: boolean;
  requireAuth?: boolean;
  title?: string;
  description?: string;
}

export function BusinessLayout({ 
  children, 
  maxHeightScreen = false, 
  requireAuth = true,
  title,
  description 
}: BusinessLayoutProps) {
  const { isAuthenticated, loading } = useLayoutContext();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Tables<'businesses'>[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const currentBusinessId = id ? parseInt(id, 10) : null;

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          toast.error('Error al obtener los negocios');
        } else {
          setBusinesses(data || []);
        }
      } catch (error) {
        toast.error('Error al obtener los negocios');
      } finally {
        setLoadingBusinesses(false);
      }
    };

    if (isAuthenticated) {
      fetchBusinesses();
    }
  }, [isAuthenticated]);

  const handleBusinessChange = (newBusinessId: string) => {
    if (!newBusinessId || newBusinessId === id) return;
    
    // Get the current path and replace the business ID
    const currentPath = location.pathname;
    const newPath = currentPath.replace(`/user/businesses/${id}`, `/user/businesses/${newBusinessId}`);
    navigate(newPath);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Cargando...</span>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className={`${maxHeightScreen ? 'h-screen' : 'min-h-screen'} flex w-full bg-background`}>
        <AppSidebar />
        <main className={`flex-1 flex flex-col ${maxHeightScreen ? 'h-screen' : 'min-h-screen'} overflow-hidden`}>
          <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
            <div className="h-14 flex items-center px-4 gap-4 border-b border-border">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            </div>
            {(title || description || (currentBusinessId && businesses.length > 0)) && (
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    {title && <h1 className="text-3xl font-bold text-foreground">{title}</h1>}
                    {description && <p className="text-base text-muted-foreground mt-1">{description}</p>}
                  </div>
                  {currentBusinessId && businesses.length > 0 && (
                    <Select
                      value={currentBusinessId.toString()}
                      onValueChange={handleBusinessChange}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Seleccionar negocio" />
                      </SelectTrigger>
                      <SelectContent>
                        {businesses.map((business) => (
                          <SelectItem key={business.id} value={business.id.toString()}>
                            {business.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}
          </header>
          <div className={`flex-1 ${maxHeightScreen ? 'overflow-hidden' : 'overflow-auto'}`}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

