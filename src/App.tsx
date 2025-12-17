import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

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
                <Index />
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
                <Products />
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
                <Placeholder />
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
