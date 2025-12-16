export interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  email: string;
  stage: string;
  createdAt: string;
  avatar?: string;
}

export interface Stage {
  id: string;
  title: string;
  color: string;
}

export const STAGES: Stage[] = [
  { id: 'new', title: 'New Lead', color: 'hsl(215, 70%, 60%)' },
  { id: 'contacted', title: 'Contacted', color: 'hsl(38, 92%, 50%)' },
  { id: 'qualified', title: 'Qualified', color: 'hsl(280, 70%, 60%)' },
  { id: 'proposal', title: 'Proposal', color: 'hsl(173, 80%, 40%)' },
  { id: 'won', title: 'Won', color: 'hsl(142, 76%, 36%)' },
];

export const INITIAL_DEALS: Deal[] = [
  { id: '1', name: 'Sarah Chen', company: 'TechFlow Inc', value: 45000, email: 'sarah@techflow.com', stage: 'new', createdAt: '2024-01-15' },
  { id: '2', name: 'Michael Brown', company: 'DataDriven Co', value: 28000, email: 'michael@datadriven.co', stage: 'new', createdAt: '2024-01-14' },
  { id: '3', name: 'Emma Wilson', company: 'CloudScale', value: 67000, email: 'emma@cloudscale.io', stage: 'contacted', createdAt: '2024-01-12' },
  { id: '4', name: 'James Taylor', company: 'Nexus Labs', value: 52000, email: 'james@nexuslabs.com', stage: 'contacted', createdAt: '2024-01-10' },
  { id: '5', name: 'Lisa Anderson', company: 'Quantum Systems', value: 89000, email: 'lisa@quantum.sys', stage: 'qualified', createdAt: '2024-01-08' },
  { id: '6', name: 'David Martinez', company: 'InnovateTech', value: 34000, email: 'david@innovate.tech', stage: 'qualified', createdAt: '2024-01-06' },
  { id: '7', name: 'Jennifer Lee', company: 'Apex Digital', value: 125000, email: 'jennifer@apex.digital', stage: 'proposal', createdAt: '2024-01-04' },
  { id: '8', name: 'Robert Johnson', company: 'Synergy Corp', value: 78000, email: 'robert@synergy.corp', stage: 'proposal', createdAt: '2024-01-02' },
  { id: '9', name: 'Amanda Clark', company: 'Velocity Ventures', value: 156000, email: 'amanda@velocity.vc', stage: 'won', createdAt: '2024-01-01' },
  { id: '10', name: 'Chris Evans', company: 'Stellar Solutions', value: 92000, email: 'chris@stellar.sol', stage: 'won', createdAt: '2023-12-28' },
];
