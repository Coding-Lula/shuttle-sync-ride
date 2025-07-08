
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Rate {
  id: string;
  rate_per_km: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useRates() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [activeRate, setActiveRate] = useState<Rate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from('rates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRates(data || []);
      const active = data?.find(rate => rate.is_active) || null;
      setActiveRate(active);
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch rates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRate = async (newRate: number) => {
    try {
      // Deactivate all current rates
      await supabase
        .from('rates')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert new active rate
      const { error } = await supabase
        .from('rates')
        .insert({
          rate_per_km: newRate,
          currency: 'ZAR',
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Rate updated to R${newRate} per km`,
      });

      await fetchRates();
    } catch (error) {
      console.error('Error updating rate:', error);
      toast({
        title: "Error",
        description: "Failed to update rate",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return {
    rates,
    activeRate,
    isLoading,
    updateRate,
    refetch: fetchRates
  };
}
