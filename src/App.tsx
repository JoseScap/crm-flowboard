import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BusinessLayout } from "@/components/BusinessLayout";
import { SimpleLayout } from "@/components/SimpleLayout";
import { LayoutProvider } from "@/components/LayoutContext";
import { ThemeProvider } from "@/hooks/use-theme";
import LoginPage from "./modules/auth/use-cases/login/Login";
import RegisterPage from "./modules/auth/use-cases/register/Register";
import PasswordRecoveryRequestPage from "./modules/auth/use-cases/password-recovery-request/PasswordRecoveryRequest";
import UpdatePasswordPage from "./modules/auth/use-cases/update-password/UpdatePassword";
import PipelinesConfigPage from "./modules/pipelines/use-cases/pipelines-config/PipelinesConfig";
import Reports from "./pages/Reports";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import ProductsHomePage from "./modules/products/use-cases/products-home/ProductsHome";
import SalesHomePage from "./modules/sales/use-cases/sales-home/SalesHome";
import NewSalePage from "./modules/sales/use-cases/new-sale/NewSale";
import PipelinesHomePage from "./modules/pipelines/use-cases/pipelines-home/PipelinesHome";
import PipelineViewPage from "./modules/pipelines/use-cases/pipeline-view/PipelineView";
import BusinessesHomePage from "./modules/businesses/use-cases/businesses-home/BusinessesHome";
import BusinessView from "./modules/businesses/use-cases/business-view/BusinessView";
import LeadDetailsPage from "./modules/leads/use-cases/lead-details/LeadDetails";
import ApplicationsHomePage from "./modules/applications/use-cases/applications-home/ApplicationsHome";
import GoogleOAuthCallbackPage from "./modules/applications/use-cases/google-oauth-callback/GoogleOAuthCallback";
import LoginGoogleCallbackPage from "./modules/auth/use-cases/login-google-callback/LoginGoogleCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LayoutProvider>
            <Routes>
              {/* Public route */}
              <Route
                path="/login"
                element={<LoginPage />}
              />
              <Route
                path="/login/google/callback"
                element={<LoginGoogleCallbackPage />}
              />
              <Route
                path="/register"
                element={<RegisterPage />}
              />
              <Route
                path="/password-recovery-request"
                element={<PasswordRecoveryRequestPage />}
              />
              <Route
                path="/update-password"
                element={<UpdatePasswordPage />}
              />
              
              {/* OAuth callback route */}
              <Route
                path="/auth/google/callback"
                element={<GoogleOAuthCallbackPage />}
              />
              
              {/* Redirect root to /user/businesses */}
              <Route
                path="/"
                element={<Navigate to="/user/businesses" replace />}
              />

              {/* Redirect /user to /user/businesses */}
              <Route
                path="/user"
                element={<Navigate to="/user/businesses" replace />}
              />
              
              {/* Protected routes with /user prefix */}
              <Route
                path="/user/businesses"
                element={
                  <SimpleLayout>
                    <BusinessesHomePage />
                  </SimpleLayout>
                }
              />
              <Route
                path="/user/businesses/:id"
                element={
                  <BusinessLayout
                    title="Panel de Control"
                    description="Resumen del rendimiento de tu negocio"
                  >
                    <BusinessView />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/pipelines"
                element={
                  <BusinessLayout
                    title="Pipelines"
                    description="Gestiona y organiza tus flujos de venta"
                  >
                    <PipelinesHomePage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/products"
                element={
                  <BusinessLayout
                    title="Productos"
                    description="Gestiona tu inventario de productos y niveles de stock"
                  >
                    <ProductsHomePage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/sales"
                element={
                  <BusinessLayout
                    title="Historial de Ventas"
                    description="Consulta y gestiona el historial de ventas y detalles de tu negocio."
                  >
                    <SalesHomePage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/sales/new"
                element={
                  <BusinessLayout
                    title="Nueva Venta"
                    description="Crea una nueva venta añadiendo productos de tu inventario."
                  >
                    <NewSalePage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/applications"
                element={
                  <BusinessLayout
                    title="Aplicaciones"
                    description="Conecta tus aplicaciones favoritas para mejorar tu experiencia CRM"
                  >
                    <ApplicationsHomePage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/pipeline/:pipelineId"
                element={
                  <BusinessLayout
                    title="Pipeline"
                    description="Consulta y gestiona tu flujo de ventas"
                  >
                    <PipelineViewPage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/pipeline/:pipelineId/lead/:leadId"
                element={
                  <BusinessLayout
                    title="Detalles del Lead"
                    description="Consulta la información y detalles del lead"
                  >
                    <LeadDetailsPage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/pipeline/:pipelineId/config"
                element={
                  <BusinessLayout
                    title="Configuración del Pipeline"
                    description="Configura los ajustes de tu pipeline"
                  >
                    <PipelinesConfigPage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/pipeline/:id/config"
                element={
                  <BusinessLayout>
                    <PipelinesConfigPage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/contacts"
                element={
                  <BusinessLayout>
                    <Placeholder />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/companies"
                element={
                  <BusinessLayout>
                    <Placeholder />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/tasks"
                element={
                  <BusinessLayout>
                    <Placeholder />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/reports"
                element={
                  <BusinessLayout>
                    <Reports />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/emails"
                element={
                  <BusinessLayout>
                    <Placeholder />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/documents"
                element={
                  <BusinessLayout>
                    <Placeholder />
                  </BusinessLayout>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LayoutProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
