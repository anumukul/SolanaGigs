import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Task status types
export type TaskStatus = 'open' | 'accepted' | 'funded' | 'submitted' | 'approved' | 'paid' | 'cancelled';

// Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  deadline?: string;
  contact_info?: string;
  image_url?: string;
  poster_wallet: string;
  poster_email?: string;
  worker_wallet?: string;
  status: TaskStatus;
  submission_url?: string;
  submission_notes?: string;
  review_notes?: string;
  escrow_tx_hash?: string;
  payout_tx_hash?: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  funded_at?: string;
  submitted_at?: string;
  completed_at?: string;
}

// Database operations
export class TaskService {
  static async createTask(task: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  static async getTasks(filters?: {
    category?: string;
    status?: TaskStatus;
    poster_wallet?: string;
    worker_wallet?: string;
  }) {
    let query = supabase.from('tasks').select('*');

    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.poster_wallet) query = query.eq('poster_wallet', filters.poster_wallet);
    if (filters?.worker_wallet) query = query.eq('worker_wallet', filters.worker_wallet);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as Task[];
  }

  static async getTask(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Task;
  }

  static async updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  static async acceptTask(id: string, worker_wallet: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'accepted',
        worker_wallet,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .neq('poster_wallet', worker_wallet) // Prevent self-assignment
      .eq('status', 'open')
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  static async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('task-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('task-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}