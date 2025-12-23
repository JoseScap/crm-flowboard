import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { Pipeline, PipelineStageDeal } from '@/types/index.types';

interface DashboardHeaderProps {
  deals: PipelineStageDeal[];
  pipelines: Pipeline[];
  selectedPipelineId?: string;
  onPipelineChange?: (pipelineId: string) => void;
  currentPipeline?: Pipeline | null;
  stagesCount?: number;
  onNewDealClick?: () => void;
  revenueValue?: { total: number; closed: number };
  conversionRate?: number;
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

export function DashboardHeader({ deals, pipelines, selectedPipelineId, onPipelineChange, currentPipeline, stagesCount, onNewDealClick, revenueValue = { total: 0, closed: 0 }, conversionRate = 0 }: DashboardHeaderProps) {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const activeDeals = deals.length;

  const stats = [
    {
      label: 'Total Pipeline',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      label: 'Won Revenue',
      value: revenueValue,
      icon: TrendingUp,
      color: 'text-success',
      isRevenue: true,
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
          <h1 className="text-3xl font-bold text-foreground">
            {currentPipeline ? currentPipeline.name : 'Sales Pipeline'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentPipeline?.description || (stagesCount && stagesCount > 0 
              ? `Track and manage your deals across ${stagesCount} stages`
              : 'Create your first stage')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pipelines.length > 0 && (
            <select
              value={selectedPipelineId || ''}
              onChange={(e) => onPipelineChange?.(e.target.value)}
              className="bg-card border border-border text-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <option value="">Select Pipeline</option>
              {pipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </select>
          )}
          <button 
            onClick={onNewDealClick}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            + New Deal
          </button>
        </div>
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
                {stat.isRevenue && typeof stat.value === 'object' && 'total' in stat.value ? (
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(stat.value.total)}{' '}
                    <span className="text-success">({formatCurrency(stat.value.closed)})</span>
                  </p>
                ) : (
                  <p className="text-xl font-bold text-foreground">{typeof stat.value === 'string' ? stat.value : ''}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
