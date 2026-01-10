import { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLayoutContext } from './LayoutContext';
import { Loader2, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials, getAvatarColor } from '@/lib/lead-utils';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';

interface SimpleLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function SimpleLayout({ children, requireAuth = true }: SimpleLayoutProps) {
  const { isAuthenticated, loading, user } = useLayoutContext();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error al cerrar sesión');
      } else {
        navigate('/login');
      }
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'U';
    // Try to get name from user_metadata first, then fallback to email
    const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'U';
    return name;
  };

  const userDisplayName = getUserDisplayName();
  const userInitials = getInitials(userDisplayName).slice(0, 3);
  const avatarColor = getAvatarColor(userDisplayName);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="w-full border-b border-border bg-card mb-8">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground">SynergIA</h1>
          </div>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={`${avatarColor} text-primary-foreground font-semibold`}>
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <main className="w-full flex-1 max-w-7xl mx-auto px-8 space-y-6">
        {children}
      </main>
    </div>
  );
}

