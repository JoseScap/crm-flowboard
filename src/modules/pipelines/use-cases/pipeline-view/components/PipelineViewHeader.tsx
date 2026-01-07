import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { usePipelineViewContext } from '../PipelineViewContext';

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

export function PipelineViewHeader() {
  const {
    pipelines,
    selectedPipelineId,
    currentPipeline,
    pipelineStages,
    pipelineLeads,
    businessEmployees,
    currentUserEmployee,
    employeeFilterId,
    setEmployeeFilterId,
    handleChangePipelineView,
    handleOpenCreateLeadDialog,
    getRevenueValue,
    getConversionRate,
  } = usePipelineViewContext();

  const leads = pipelineLeads.filter(lead => {
    if (lead.pipeline_stage_id === null) return false;
    if (employeeFilterId === 'all') return true;
    const employeeId = employeeFilterId === 'unassigned' ? null : parseInt(employeeFilterId, 10);
    return lead.business_employee_id === employeeId;
  });
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const activeLeads = leads.length;
  const revenueValue = getRevenueValue();
  const conversionRate = getConversionRate();

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
      label: 'Active Leads',
      value: activeLeads.toString(),
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

  const handleNewLeadClick = () => {
    // If there are stages, use the first one; otherwise use empty string
    const firstStageId = pipelineStages.length > 0 ? pipelineStages[0].id : '';
    handleOpenCreateLeadDialog(firstStageId.toString());
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {currentPipeline ? currentPipeline.name : 'Sales Pipeline'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentPipeline?.description || (pipelineStages.length > 0 
              ? `Track and manage your leads across ${pipelineStages.length} stages`
              : 'Create your first stage')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {businessEmployees.length > 0 && (
            <select
              value={employeeFilterId}
              onChange={(e) => setEmployeeFilterId(e.target.value)}
              className="bg-card border border-border text-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {businessEmployees.map((employee) => (
                <option key={employee.id} value={employee.id.toString()}>
                  {employee.id === currentUserEmployee?.id ? 'Assigned to: Me' : `Assigned to: ${employee.email.split('@')[0]}`}
                </option>
              ))}
            </select>
          )}
          {pipelines.length > 0 && (
            <select
              value={selectedPipelineId}
              onChange={(e) => handleChangePipelineView(e.target.value)}
              className="bg-card border border-border text-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {pipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </select>
          )}
          <button 
            onClick={handleNewLeadClick}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            + New Lead
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

