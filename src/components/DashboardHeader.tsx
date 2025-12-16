import { Deal, STAGES } from '@/types/crm';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

interface DashboardHeaderProps {
  deals: Deal[];
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

export function DashboardHeader({ deals }: DashboardHeaderProps) {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = deals.filter((d) => d.stage === 'won');
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  const activeDeals = deals.filter((d) => d.stage !== 'won').length;
  const conversionRate = deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(0) : 0;

  const stats = [
    {
      label: 'Total Pipeline',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      label: 'Won Revenue',
      value: formatCurrency(wonValue),
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      label: 'Active Deals',
      value: activeDeals.toString(),
      icon: Users,
      color: 'text-warning',
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: Target,
      color: 'text-primary',
    },
  ];

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your deals across {STAGES.length} stages
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          + New Deal
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4 animate-fade-in"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
