import { supabase } from '../lib/supabase';

/**
 * Check if user has completed tutorial
 */
export async function hasTutorialCompleted(employeeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('tutorial_completed')
      .eq('employee_id', employeeId)
      .single();

    if (error || !data) {
      console.error('Error checking tutorial status:', error);
      return false;
    }

    return data.tutorial_completed || false;
  } catch (err) {
    console.error('Exception in hasTutorialCompleted:', err);
    return false;
  }
}

/**
 * Mark tutorial as completed for user
 */
export async function markTutorialCompleted(employeeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ tutorial_completed: true })
      .eq('employee_id', employeeId);

    if (error) {
      console.error('Error marking tutorial completed:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in markTutorialCompleted:', err);
    return false;
  }
}

/**
 * Reset tutorial status (for replay from settings)
 */
export async function resetTutorialStatus(employeeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ tutorial_completed: false })
      .eq('employee_id', employeeId);

    if (error) {
      console.error('Error resetting tutorial:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in resetTutorialStatus:', err);
    return false;
  }
}