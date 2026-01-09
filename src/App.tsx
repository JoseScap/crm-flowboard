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
                    title="Dashboard"
                    description="Overview of your business performance"
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
                    description="Manage and organize your sales pipelines"
                  >
                    <PipelinesHomePage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/products"
                element={
                  <BusinessLayout
                    title="Products"
                    description="Manage your product inventory and stock levels"
                  >
                    <ProductsHomePage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/sales"
                element={
                  <BusinessLayout
                    title="Sales History"
                    description="View and manage your business sales history and details."
                  >
                    <SalesHomePage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/sales/new"
                element={
                  <BusinessLayout
                    title="New Sale"
                    description="Create a new sale by adding products from your inventory."
                  >
                    <NewSalePage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/applications"
                element={
                  <BusinessLayout
                    title="Applications"
                    description="Connect your favorite apps to enhance your CRM experience"
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
                    description="View and manage your sales pipeline"
                  >
                    <PipelineViewPage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/pipeline/:pipelineId/lead/:leadId"
                element={
                  <BusinessLayout
                    title="Lead Details"
                    description="View lead information and details"
                  >
                    <LeadDetailsPage />
                  </BusinessLayout>
                }
              />
              <Route
                path="/user/businesses/:id/pipeline/:pipelineId/config"
                element={
                  <BusinessLayout
                    title="Pipeline Configuration"
                    description="Configure settings for your pipeline"
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
