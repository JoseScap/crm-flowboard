import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  LogOut,
  BarChart3,
  Mail,
  FileText,
  Moon,
  Sun,
  Package,
  ShoppingCart,
  Settings,
  Plug,
} from 'lucide-react';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';

// Business navigation items - only shown when inside a business route
const businessNavItems = [
  { title: 'Pipeline', path: 'pipelines', icon: LayoutDashboard },
  { title: 'Products', path: 'products', icon: Package },
  { title: 'Sales', path: 'sales', icon: ShoppingCart },
  { title: 'Contacts', path: 'contacts', icon: Users },
  { title: 'Companies', path: 'companies', icon: Building2 },
  { title: 'Tasks', path: 'tasks', icon: Calendar },
  { title: 'Reports', path: 'reports', icon: BarChart3 },
  { title: 'Emails', path: 'emails', icon: Mail },
  { title: 'Documents', path: 'documents', icon: FileText },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { theme, toggleTheme } = useTheme();

  // Extract business ID from path if we're in a business route
  const businessIdMatch = currentPath.match(/\/user\/businesses\/(\d+)/);
  const businessId = businessIdMatch ? businessIdMatch[1] : null;
  const isInBusinessRoute = businessId !== null;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error);
        toast.error('Error logging out');
      } else {
        toast.success('Logged out successfully');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <Link 
          to={isInBusinessRoute ? `/user/businesses/${businessId}` : '/user'} 
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-tight">SynergIA</h1>
            <p className="text-xs text-muted-foreground">Sales Pipeline</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {isInBusinessRoute && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-3 mb-2">
              General
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === `/user/businesses/${businessId}`}
                    className="w-full"
                  >
                    <Link
                      to={`/user/businesses/${businessId}`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        currentPath === `/user/businesses/${businessId}`
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === '/user/settings' || currentPath.startsWith('/user/settings/')}
                    className="w-full"
                  >
                    <Link
                      to="/user/settings"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        currentPath === '/user/settings' || currentPath.startsWith('/user/settings/')
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isInBusinessRoute && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Business
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {businessNavItems.map((item) => {
                  const itemPath = `/user/businesses/${businessId}/${item.path}`;
                  const isItemActive = currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isItemActive}
                        className="w-full"
                      >
                        <Link
                          to={itemPath}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            isItemActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isInBusinessRoute && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-3 mb-2">
              User
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === `/user/businesses/${businessId}/applications` || currentPath.startsWith(`/user/businesses/${businessId}/applications/`)}
                    className="w-full"
                  >
                    <Link
                      to={`/user/businesses/${businessId}/applications`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        currentPath === `/user/businesses/${businessId}/applications` || currentPath.startsWith(`/user/businesses/${businessId}/applications/`)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <Plug className="w-5 h-5" />
                      <span className="font-medium">Applications</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3 text-muted-foreground">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="font-medium text-sm">Dark Mode</span>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
          />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
