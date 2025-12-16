import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Deal, STAGES, INITIAL_DEALS } from '@/types/crm';
import { KanbanColumn } from './KanbanColumn';

export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setDeals((prevDeals) =>
      prevDeals.map((deal) =>
        deal.id === draggableId
          ? { ...deal, stage: destination.droppableId }
          : deal
      )
    );
  };

  const getDealsByStage = (stageId: string) => {
    return deals.filter((deal) => deal.stage === stageId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={getDealsByStage(stage.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
