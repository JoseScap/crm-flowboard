import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/hooks/use-theme";
import PipelineView from "./pages/PipelineView";
import DealDetail from "./pages/DealDetail";
import PipelineConfig from "./pages/PipelineConfig";
import ProductsHome from "./modules/products/use-cases/products-home/ProductsHome";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import Pipelines from "./pages/Pipelines";
import ProductsHomePage from "./modules/products/use-cases/products-home/ProductsHome";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Pipelines />
              </Layout>
            }
          />
          <Route
            path="/pipeline/:id"
            element={
              <Layout>
                <PipelineView />
              </Layout>
            }
          />
          <Route
            path="/deal/:dealId"
            element={
              <Layout maxHeightScreen>
                <DealDetail />
              </Layout>
            }
          />
          <Route
            path="/pipeline/:id/config"
            element={
              <Layout>
                <PipelineConfig />
              </Layout>
            }
          />
          <Route
            path="/sales"
            element={
              <Layout>
                <Sales />
              </Layout>
            }
          />
          <Route
            path="/products"
            element={
              <Layout>
                <ProductsHomePage />
              </Layout>
            }
          />
          <Route
            path="/contacts"
            element={
              <Layout>
                <Placeholder />
              </Layout>
            }
          />
          <Route
            path="/companies"
            element={
              <Layout>
                <Placeholder />
              </Layout>
            }
          />
          <Route
            path="/tasks"
            element={
              <Layout>
                <Placeholder />
              </Layout>
            }
          />
          <Route
            path="/reports"
            element={
              <Layout>
                <Reports />
              </Layout>
            }
          />
          <Route
            path="/emails"
            element={
              <Layout>
                <Placeholder />
              </Layout>
            }
          />
          <Route
            path="/documents"
            element={
              <Layout>
                <Placeholder />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <Placeholder />
              </Layout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
