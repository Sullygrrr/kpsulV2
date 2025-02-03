import { createClient } from '@supabase/supabase-js';

// Remplacer directement par tes informations Supabase
const supabaseUrl = 'https://qidmhekyrndmdooosbwx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpZG1oZWt5cm5kbWRvb29zYnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNzAyNzEsImV4cCI6MjA1Mzk0NjI3MX0.0UenPMPcB-12-R5EMS_5q8hg7srto6mg4IoUrk3tO5M';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
