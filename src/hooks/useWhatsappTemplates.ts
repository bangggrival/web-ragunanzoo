import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WhatsappTemplate {
  id: string;
  message_id: string;
  message_en: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export function useWhatsappTemplates() {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data) {
      setTemplates(data as WhatsappTemplate[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, fetchTemplates };
}
