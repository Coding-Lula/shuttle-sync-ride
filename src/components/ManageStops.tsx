import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useShuttleStops } from '@/hooks/useShuttleStops';
import { supabase } from '@/integrations/supabase/client';

const ManageStops = () => {
  const { stops, isLoading, refetch } = useShuttleStops();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStop, setNewStop] = useState({ name: '', distance: '' });
  const [editingStop, setEditingStop] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', distance: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addStop = async () => {
    if (!newStop.name || !newStop.distance) {
      toast({
        title: "Incomplete information",
        description: "Please fill in both name and distance",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('stops')
        .insert({
          name: newStop.name,
          distance_km: parseFloat(newStop.distance)
        });

      if (error) throw error;

      setNewStop({ name: '', distance: '' });
      setShowAddForm(false);
      await refetch();

      toast({
        title: "Stop added",
        description: `${newStop.name} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error adding stop:', error);
      toast({
        title: "Error",
        description: "Failed to add stop",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeStop = async (stopId: string) => {
    const stop = stops.find(s => s.id === stopId);
    
    try {
      const { error } = await supabase
        .from('stops')
        .delete()
        .eq('id', stopId);

      if (error) throw error;

      await refetch();
      
      toast({
        title: "Stop removed",
        description: `${stop?.name} has been removed successfully.`,
      });
    } catch (error) {
      console.error('Error removing stop:', error);
      toast({
        title: "Error",
        description: "Failed to remove stop",
        variant: "destructive",
      });
    }
  };

  const startEdit = (stop: any) => {
    setEditingStop(stop.id);
    setEditData({ name: stop.name, distance: stop.distance_km.toString() });
  };

  const saveEdit = async () => {
    if (!editData.name || !editData.distance) {
      toast({
        title: "Incomplete information",
        description: "Please fill in both name and distance",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('stops')
        .update({
          name: editData.name,
          distance_km: parseFloat(editData.distance)
        })
        .eq('id', editingStop);

      if (error) throw error;

      setEditingStop(null);
      setEditData({ name: '', distance: '' });
      await refetch();

      toast({
        title: "Stop updated",
        description: "Stop information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating stop:', error);
      toast({
        title: "Error",
        description: "Failed to update stop",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingStop(null);
    setEditData({ name: '', distance: '' });
  };

  const calculateEstimatedCost = (distance: number, rate: number = 6.00) => {
    return (distance * rate).toFixed(2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading shuttle stops...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Manage Stops</span>
            </CardTitle>
            <CardDescription>View and manage shuttle stops and their distances</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} disabled={isSubmitting}>
            <Plus className="w-4 h-4 mr-2" />
            Add Stop
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-3">Add New Shuttle Stop</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Stop Name"
                value={newStop.name}
                onChange={(e) => setNewStop({...newStop, name: e.target.value})}
              />
              <Input
                placeholder="Distance (km)"
                type="number"
                step="0.1"
                value={newStop.distance}
                onChange={(e) => setNewStop({...newStop, distance: e.target.value})}
              />
            </div>
            <div className="flex space-x-2 mt-4">
              <Button onClick={addStop} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Stop
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {stops.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No shuttle stops configured yet. Add your first stop above.
            </div>
          ) : (
            stops.map((stop) => (
              <div key={stop.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                {editingStop === stop.id ? (
                  <div className="flex items-center space-x-4 flex-1">
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="flex-1"
                    />
                    <Input
                      value={editData.distance}
                      onChange={(e) => setEditData({...editData, distance: e.target.value})}
                      type="number"
                      step="0.1"
                      className="w-24"
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{stop.name}</p>
                        <p className="text-sm text-gray-600">
                          {stop.distance_km} km • Est. cost: R{calculateEstimatedCost(stop.distance_km)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">Active</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(stop)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeStop(stop.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageStops;