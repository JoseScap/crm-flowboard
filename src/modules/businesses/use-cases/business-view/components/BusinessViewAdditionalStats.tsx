import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Package, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBusinessViewContext } from '../BusinessViewContext';

export function BusinessViewAdditionalStats() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stats } = useBusinessViewContext();

  return (
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
  );
}

