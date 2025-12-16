import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Deal, Stage } from '@/types/crm';
import { DealCard } from './DealCard';
import { DollarSign } from 'lucide-react';

interface KanbanColumnProps {
  stage: Stage;
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

export function KanbanColumn({ stage, deals }: KanbanColumnProps) {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="flex flex-col bg-secondary/30 rounded-xl min-w-[320px] max-w-[320px] h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-semibold text-foreground">{stage.title}</h3>
          <span className="ml-auto bg-muted text-muted-foreground text-xs font-medium px-2 py-1 rounded-full">
            {deals.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <DollarSign className="w-4 h-4" />
          <span>{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {/* Cards */}
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
          >
            {deals.map((deal, index) => (
              <Draggable key={deal.id} draggableId={deal.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`transition-transform ${
                      snapshot.isDragging ? 'rotate-2 scale-105' : ''
                    }`}
                  >
                    <DealCard deal={deal} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
