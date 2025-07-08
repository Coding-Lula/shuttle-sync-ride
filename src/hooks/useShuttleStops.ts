
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShuttleStop {
  id: string;
  name: string;
  distance_km: number;
  created_at?: string;
}

export function useShuttleStops() {
  const [stops, setStops] = useState<ShuttleStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStops = async () => {
    try {
      const { data, error } = await supabase
        .from('stops')
        .select('*')
        .order('name');

      if (error) throw error;
      setStops(data || []);
    } catch (error) {
      console.error('Error fetching stops:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shuttle stops",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  return {
    stops,
    isLoading,
    refetch: fetchStops
  };
}
