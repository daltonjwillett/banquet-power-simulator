import { supabase } from './supabase';
import type { Database } from '../types/database';

// Type aliases for convenience
type User = Database['public']['Tables']['users']['Row'];
// type ScenarioAttempt = Database['public']['Tables']['scenario_attempts']['Row'];
// type UserProgress = Database['public']['Tables']['user_progress']['Row'];

// ==================== USER OPERATIONS ====================

/**
 * Get user by employee ID
 */
export async function getUser(employeeId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('employee_id', employeeId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception in getUser:', err);
    return null;
  }
}

/**
 * Create a new user (admin function)
 */
export async function createUser(employeeId: string, name: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .insert({ employee_id: employeeId, name });

    if (error) {
      console.error('Error creating user:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in createUser:', err);
    return false;
  }
}

/**
 * Update user name (admin function)
 */
export async function updateUserName(employeeId: string, newName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ name: newName })
      .eq('employee_id', employeeId);

    if (error) {
      console.error('Error updating user:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in updateUserName:', err);
    return false;
  }
}

/**
 * Delete user (admin function)
 */
export async function deleteUser(employeeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('employee_id', employeeId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in deleteUser:', err);
    return false;
  }
}

/**
 * Get all users (admin function)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception in getAllUsers:', err);
    return [];
  }
}

// ==================== SCENARIO ATTEMPTS ====================

/**
 * Submit a scenario attempt
 */
export async function submitAttempt(
  employeeId: string,
  scenarioId: number,
  timeSeconds: number,
  usedHint1: boolean,
  usedHint2: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scenario_attempts')
      .insert({
        employee_id: employeeId,
        scenario_id: scenarioId,
        time_seconds: timeSeconds,
        used_hint1: usedHint1,
        used_hint2: usedHint2,
      });

    if (error) {
      console.error('Error submitting attempt:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in submitAttempt:', err);
    return false;
  }
}

/**
 * Get top 5 times for a scenario
 */
export async function getScenarioLeaderboard(
  scenarioId: number
): Promise<Array<{
  rank: number;
  employeeId: string;
  employeeName: string;
  timeSeconds: number;
  usedHint1: boolean;
  usedHint2: boolean;
  completedAt: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('scenario_attempts')
      .select(`
        employee_id,
        time_seconds,
        used_hint1,
        used_hint2,
        completed_at,
        users (name)
      `)
      .eq('scenario_id', scenarioId)
      .order('time_seconds', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    if (!data) return [];

    // Transform data and add rank
    return data.map((entry, index) => ({
      rank: index + 1,
      employeeId: entry.employee_id,
      employeeName: (entry.users as unknown as { name: string }).name,
      timeSeconds: entry.time_seconds,
      usedHint1: entry.used_hint1,
      usedHint2: entry.used_hint2,
      completedAt: entry.completed_at,
    }));
  } catch (err) {
    console.error('Exception in getScenarioLeaderboard:', err);
    return [];
  }
}

/**
 * Get user's best time for a scenario
 */
export async function getUserBestTime(
  employeeId: string,
  scenarioId: number
): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('scenario_attempts')
      .select('time_seconds')
      .eq('employee_id', employeeId)
      .eq('scenario_id', scenarioId)
      .order('time_seconds', { ascending: true })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data.time_seconds;
  } catch (err) {
    // Not an error if user hasn't completed scenario yet
    return null;
  }
}

/**
 * Get user's rank for a scenario (null if not in top 5)
 */
export async function getUserRank(
  employeeId: string,
  scenarioId: number,
  timeSeconds: number
): Promise<number | null> {
  try {
    // Get all times better than or equal to this time
    const { data, error } = await supabase
      .from('scenario_attempts')
      .select('employee_id, time_seconds')
      .eq('scenario_id', scenarioId)
      .lte('time_seconds', timeSeconds)
      .order('time_seconds', { ascending: true });

    if (error || !data) {
      return null;
    }

    // Find user's position
    const userIndex = data.findIndex(
      entry => entry.employee_id === employeeId && entry.time_seconds === timeSeconds
    );

    if (userIndex === -1 || userIndex >= 5) {
      return null; // Not in top 5
    }

    return userIndex + 1; // Rank is 1-indexed
  } catch (err) {
    console.error('Exception in getUserRank:', err);
    return null;
  }
}

/**
 * Delete a scenario attempt (admin function)
 */
export async function deleteAttempt(attemptId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scenario_attempts')
      .delete()
      .eq('id', attemptId);

    if (error) {
      console.error('Error deleting attempt:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in deleteAttempt:', err);
    return false;
  }
}

// ==================== USER PROGRESS (Anti-Replay) ====================

/**
 * Get user's last 3 completed scenarios
 */
export async function getLastThreeScenarios(employeeId: string): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('last_three_scenarios')
      .eq('employee_id', employeeId)
      .single();

    if (error || !data) {
      return []; // New user, no history
    }

    return data.last_three_scenarios || [];
  } catch (err) {
    return []; // Not an error, just means new user
  }
}

/**
 * Update user's last 3 scenarios after successful completion
 */
export async function updateLastThreeScenarios(
  employeeId: string,
  newScenarioId: number
): Promise<boolean> {
  try {
    // First, get current last_three_scenarios
    const currentProgress = await getLastThreeScenarios(employeeId);

    // Add new scenario and keep only last 3
    const updatedList = [...currentProgress, newScenarioId].slice(-3);

    // Upsert (insert or update)
    const { error } = await supabase
      .from('user_progress')
      .upsert(
        {
          employee_id: employeeId,
          last_three_scenarios: updatedList,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'employee_id' }
      );

    if (error) {
      console.error('Error updating progress:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in updateLastThreeScenarios:', err);
    return false;
  }
}

/**
 * Get available scenarios for user (excludes last 3)
 */
export async function getAvailableScenarios(employeeId: string): Promise<number[]> {
  const lastThree = await getLastThreeScenarios(employeeId);
  
  // All scenarios (1-50)
  const allScenarios = Array.from({ length: 50 }, (_, i) => i + 1);
  
  // Filter out last 3
  return allScenarios.filter(id => !lastThree.includes(id));
}

/**
 * Get random available scenario for user
 */
export async function getRandomAvailableScenario(employeeId: string): Promise<number> {
  const available = await getAvailableScenarios(employeeId);
  
  if (available.length === 0) {
    // Shouldn't happen, but fallback to random scenario
    return Math.floor(Math.random() * 50) + 1;
  }
  
  // Random selection from available pool
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}