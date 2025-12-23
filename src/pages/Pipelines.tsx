import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { FolderKanban, Plus, Calendar, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tables } from '@/types/supabase.schema';

const Pipelines = () => {
  const [pipelines, setPipelines] = useState<Tables<'pipelines'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const navigate = useNavigate();

  const getPipelines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('pipelines').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching pipelines:', error);
      } else if (data) {
        setPipelines(data);
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPipelines();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handlePipelineClick = (pipelineId: string) => {
    navigate(`/pipeline/${pipelineId}`);
  };

  const handleConfigClick = (e: React.MouseEvent, pipelineId: string) => {
    e.stopPropagation();
    navigate(`/pipeline/${pipelineId}/config`);
  };

  const handleOpenDialog = () => {
    setFormData({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ name: '', description: '' });
  };

  const handleSave = async () => {
    // Step 1: Close modal immediately
    handleCloseDialog();
    
    // Step 2: Set loading state
    setLoading(true);
    
    try {
      // Step 3: Insert into Supabase
      const { error } = await supabase
        .from('pipelines')
        .insert([
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
          },
        ]);
      
      if (error) {
        console.error('Error creating pipeline:', error);
      }
      
      // Step 4: Refetch pipelines (whether it failed or succeeded)
      await getPipelines();
    } catch (error) {
      console.error('Error creating pipeline:', error);
      // Still refetch to ensure UI is in sync
      await getPipelines();
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading pipelines...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 h-full">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pipelines</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your sales pipelines
            </p>
          </div>
          <Button onClick={handleOpenDialog} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Pipeline
          </Button>
        </div>
      </div>

      {pipelines.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-center">
          <FolderKanban className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No pipelines yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first pipeline to start managing your sales process
          </p>
          <Button onClick={handleOpenDialog} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Pipeline
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              onClick={() => handlePipelineClick(pipeline.id)}
              className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group animate-fade-in relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => handleConfigClick(e, pipeline.id)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {pipeline.name}
              </h3>
              
              {pipeline.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {pipeline.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(pipeline.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Pipeline</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter pipeline name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter pipeline description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              Create Pipeline
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pipelines;

