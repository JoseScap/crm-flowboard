import { ReactNode, useEffect, useState, Fragment } from "react";
import {
  Navigate,
  useParams,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLayoutContext } from "./LayoutContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import supabase from "@/modules/common/lib/supabase";
import { Tables } from "@/modules/types/supabase.schema";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

interface BusinessLayoutProps {
  children: ReactNode;
  maxHeightScreen?: boolean;
  requireAuth?: boolean;
  title?: string;
  description?: string;
  breadcrumbs?: {
    label: string;
    path?: string;
  }[];
}

export function BusinessLayout({
  children,
  maxHeightScreen = false,
  requireAuth = true,
  title,
  description,
  breadcrumbs,
}: BusinessLayoutProps) {
  const { isAuthenticated, loading } = useLayoutContext();
  const params = useParams();

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
      <div
        className={`${
          maxHeightScreen ? "h-screen" : "min-h-screen"
        } flex w-full bg-background`}
      >
        <AppSidebar />
        <main
          className={`flex-1 flex flex-col ${
            maxHeightScreen ? "h-screen" : "min-h-screen"
          } overflow-hidden`}
        >
          <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
            <div className="h-14 flex items-center px-8 gap-4 border-b border-border">
              {breadcrumbs && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((breadcrumb, index) => {
                      let newPath = breadcrumb.path;
                      if (breadcrumb.path?.includes(':')) {
                        const paramsToReplace = breadcrumb.path.split('/').filter(x => x.startsWith(':'));
                        
                        for (const param of paramsToReplace) {
                          newPath = newPath.replace(`${param}`, params[param.slice(1)]);
                        }
                      }

                      return (
                      <Fragment key={breadcrumb.label}>
                        <BreadcrumbItem>
                          {breadcrumb.path && (
                            <BreadcrumbLink asChild>
                              <Link to={newPath}>
                                {breadcrumb.label}
                              </Link>
                            </BreadcrumbLink>
                          )}
                          {!breadcrumb.path && (
                            <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && (
                          <BreadcrumbSeparator />
                        )}
                      </Fragment>
                    )})}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>
            {(title || description) && (
              <div className="px-8 py-8">
                <div className="flex items-center justify-between">
                  <div>
                    {title && (
                      <h1 className="text-3xl font-bold text-foreground">
                        {title}
                      </h1>
                    )}
                    {description && (
                      <p className="text-base text-muted-foreground mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </header>
          <div
            className={`flex-1 ${
              maxHeightScreen ? "overflow-hidden" : "overflow-auto"
            } px-8 pb-8 space-y-6`}
          >
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
