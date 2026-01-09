import { DragDropContext } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KanbanColumn } from '@/components/KanbanColumn';
import { usePipelineViewContext } from '../PipelineViewContext';

export function PipelineViewKanbanBoard() {
  const {
    pipelineStages,
    businessEmployees,
    currentUserEmployee,
    isReordering,
    handleDragEnd,
    handleMoveStage,
    handleOpenEditStageDialog,
    handleOpenArchiveLeadDialog,
    handleOpenCreateStageDialog,
    getLeadsByStage,
  } = usePipelineViewContext();

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ height: 'calc(100vh - 340px)' }}>
        {pipelineStages.map((stage, index) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={getLeadsByStage(stage.id.toString())}
            businessEmployees={businessEmployees}
            currentUserEmployeeId={currentUserEmployee?.id}
            index={index}
            totalStages={pipelineStages.length}
            onMoveLeft={() => handleMoveStage(index, 'left')}
            onMoveRight={() => handleMoveStage(index, 'right')}
            onEditClick={() => handleOpenEditStageDialog(stage)}
            onArchiveLead={handleOpenArchiveLeadDialog}
            isReordering={isReordering}
          />
        ))}
        {/* Empty column for creating new stage */}
        <div className="flex flex-col bg-secondary/30 rounded-xl min-w-[320px] max-w-[320px] h-full border-2 border-dashed border-border/50">
          <div className="flex-1 flex items-center justify-center p-4">
            <Button
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2 border-border hover:bg-primary/10 hover:border-primary/50 transition-colors"
              onClick={handleOpenCreateStageDialog}
              disabled={isReordering}
            >
              <Plus className="w-5 h-5" />
              {pipelineStages.length === 0 ? 'Crear Primera Etapa' : 'Crear Nueva Etapa'}
            </Button>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}

