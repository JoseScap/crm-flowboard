import { Droppable, Draggable } from '@hello-pangea/dnd';
import { DealCard } from './DealCard';
import { DollarSign, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tables } from '@/modules/types/supabase.schema';

interface KanbanColumnProps {
  stage: Tables<'pipeline_stages'>;
  deals: Tables<'pipeline_stage_deals'>[];
  index: number;
  totalStages: number;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onEditClick: () => void;
  onArchiveDeal?: (deal: Tables<'pipeline_stage_deals'>) => void;
  isReordering: boolean;
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

export function KanbanColumn({ stage, deals, index, totalStages, onMoveLeft, onMoveRight, onEditClick, onArchiveDeal, isReordering }: KanbanColumnProps) {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const canMoveLeft = index > 0;
  const canMoveRight = index < totalStages - 1;

  return (
    <div className="flex flex-col bg-secondary/30 rounded-xl min-w-[320px] max-w-[320px] h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={onMoveLeft}
            disabled={!canMoveLeft || isReordering}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-semibold text-foreground">{stage.name}</h3>
            <span className="ml-auto bg-muted text-muted-foreground text-xs font-medium px-2 py-1 rounded-full">
              {deals.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={onMoveRight}
            disabled={!canMoveRight || isReordering}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(totalValue)}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={onEditClick}
            disabled={isReordering}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards */}
      <Droppable droppableId={stage.id.toString()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
          >
            {deals.map((deal, index) => (
              <Draggable key={deal.id} draggableId={deal.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`transition-transform ${
                      snapshot.isDragging ? 'rotate-2 scale-105' : ''
                    }`}
                  >
                    <DealCard 
                      deal={deal} 
                      onArchiveClick={onArchiveDeal ? () => onArchiveDeal(deal) : undefined}
                    />
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
