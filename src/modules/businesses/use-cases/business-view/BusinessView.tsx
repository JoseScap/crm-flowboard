import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Settings, Loader2, DollarSign, ShoppingCart, Package, LayoutDashboard, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import supabase from '@/modules/common/lib/supabase';
import { Tables } from '@/modules/types/supabase.schema';

interface BusinessStats {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  totalPipelines: number;
  openSales: number;
  closedSales: number;
}

const BusinessView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Tables<'businesses'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BusinessStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalPipelines: 0,
    openSales: 0,
    closedSales: 0,
  });

  useEffect(() => {
    if (!id) return;

    const fetchBusinessData = async () => {
      try {
        const businessId = parseInt(id || '0', 10);
        if (isNaN(businessId)) {
          throw new Error('Invalid business ID');
        }

        // Fetch business
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single();

        if (businessError) throw businessError;
        setBusiness(businessData);

        // Fetch statistics
        const salesResponse = await supabase
          .from('sales')
          .select('total, is_open')
          .eq('business_id', businessId);

        const productsResponse = await supabase
          .from('products')
          .select('id')
          .eq('business_id', businessId);

        const pipelinesResponse = await supabase
          .from('pipelines')
          .select('id')
          .eq('business_id', businessId);

        // Calculate stats
        const sales = (salesResponse.data) || [];
        const totalRevenue = sales.reduce((sum: number, sale) => sum + (Number(sale.total) || 0), 0);
        const openSales = sales.filter((sale) => sale.is_open === true).length;
        const closedSales = sales.filter((sale) => sale.is_open === false).length;

        setStats({
          totalSales: sales.length,
          totalRevenue,
          totalProducts: (productsResponse.data as any[])?.length || 0,
          totalPipelines: (pipelinesResponse.data as any[])?.length || 0,
          openSales,
          closedSales,
        });
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Business not found</h2>
          <Button onClick={() => navigate('/user/businesses')} variant="outline">
            Go back to businesses
          </Button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Total Sales',
      value: stats.totalSales.toString(),
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Pipelines',
      value: stats.totalPipelines.toString(),
      icon: LayoutDashboard,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sales Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Open Sales</span>
                  <span className="text-lg font-bold text-foreground">{stats.openSales}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Closed Sales</span>
                  <span className="text-lg font-bold text-foreground">{stats.closedSales}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/user/businesses/${id}/products`)}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Manage Products
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/user/businesses/${id}/pipelines`)}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  View Pipelines
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/user/businesses/${id}/sales`)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Process Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default BusinessView;
