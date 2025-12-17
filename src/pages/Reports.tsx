import { BarChart3, TrendingUp, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const salesByMonth = [
  { month: 'Ene', ventas: 45000, gastos: 32000 },
  { month: 'Feb', ventas: 52000, gastos: 35000 },
  { month: 'Mar', ventas: 48000, gastos: 30000 },
  { month: 'Abr', ventas: 61000, gastos: 38000 },
  { month: 'May', ventas: 55000, gastos: 34000 },
  { month: 'Jun', ventas: 67000, gastos: 40000 },
  { month: 'Jul', ventas: 72000, gastos: 42000 },
  { month: 'Ago', ventas: 69000, gastos: 41000 },
  { month: 'Sep', ventas: 78000, gastos: 45000 },
  { month: 'Oct', ventas: 82000, gastos: 48000 },
  { month: 'Nov', ventas: 91000, gastos: 52000 },
  { month: 'Dic', ventas: 98000, gastos: 55000 },
];

const salesByCategory = [
  { name: 'Electronics', value: 45000, color: 'hsl(var(--primary))' },
  { name: 'Accessories', value: 28000, color: 'hsl(var(--chart-2))' },
  { name: 'Software', value: 15000, color: 'hsl(var(--chart-3))' },
  { name: 'Services', value: 12000, color: 'hsl(var(--chart-4))' },
];

const topProducts = [
  { name: 'Laptop Pro 15"', ventas: 156, ingresos: 202644 },
  { name: 'Monitor 27"', ventas: 98, ingresos: 39102 },
  { name: 'Headphones', ventas: 87, ingresos: 17313 },
  { name: 'Keyboard', ventas: 76, ingresos: 9804 },
  { name: 'Wireless Mouse', ventas: 134, ingresos: 6566 },
];

const dailySales = [
  { day: 'Lun', ventas: 12500 },
  { day: 'Mar', ventas: 15800 },
  { day: 'Mié', ventas: 14200 },
  { day: 'Jue', ventas: 18900 },
  { day: 'Vie', ventas: 22100 },
  { day: 'Sáb', ventas: 25600 },
  { day: 'Dom', ventas: 8900 },
];

const stats = [
  {
    title: 'Ventas Totales',
    value: '$818,000',
    change: '+12.5%',
    icon: DollarSign,
    positive: true,
  },
  {
    title: 'Órdenes',
    value: '1,247',
    change: '+8.2%',
    icon: ShoppingCart,
    positive: true,
  },
  {
    title: 'Productos Vendidos',
    value: '3,842',
    change: '+15.3%',
    icon: Package,
    positive: true,
  },
  {
    title: 'Ticket Promedio',
    value: '$656',
    change: '-2.1%',
    icon: TrendingUp,
    positive: false,
  },
];

export default function Reports() {
  return (
    <div className="p-6 space-y-6">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-1">Análisis de ventas y métricas del negocio</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold">{stat.value}</p>
                    <span
                      className={`text-xs font-medium ${
                        stat.positive ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendencia de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value / 1000}K`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  name="Ventas"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line
                  type="monotone"
                  dataKey="gastos"
                  name="Gastos"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--muted-foreground))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Productos por Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value / 1000}K`} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                />
                <Bar dataKey="ingresos" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Día de la Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value / 1000}K`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventas']}
                />
                <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Producto</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Unidades</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ingresos</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">% del Total</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => {
                  const totalIngresos = topProducts.reduce((sum, p) => sum + p.ingresos, 0);
                  const percentage = ((product.ingresos / totalIngresos) * 100).toFixed(1);
                  return (
                    <tr key={product.name} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">{product.ventas}</td>
                      <td className="py-3 px-4 text-right font-medium">${product.ingresos.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
