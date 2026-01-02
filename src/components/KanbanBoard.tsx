import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Tables } from '@/modules/types/supabase.schema';

export function KanbanBoard() {
  const [deals, setDeals] = useState<Tables<'pipeline_stage_deals'>[]>([]);

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
        deal.id.toString() === draggableId
          ? { ...deal, pipeline_stage_id: parseInt(destination.droppableId, 10) }
          : deal
      )
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {/* KanbanBoard component - stages should come from props or DB */}
      </div>
    </DragDropContext>
  );
}
