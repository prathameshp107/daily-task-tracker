import { apiClient } from '@/lib/api/client';

export type LeaveType = 'vacation' | 'sick' | 'personal' | 'other';

export interface LeaveEntry {
  _id: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  type: LeaveType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveDto {
  date: string; // ISO date string (YYYY-MM-DD)
  type: LeaveType;
  notes?: string;
}

export interface LeaveFilters {
  startDate?: string; // ISO date string (YYYY-MM-DD)
  endDate?: string;   // ISO date string (YYYY-MM-DD)
  type?: LeaveType;
}

export const leaveService = {
  /**
   * Get all leave entries with optional filters
   */
  async getLeaves(filters: LeaveFilters = {}): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);
      
      const response = await apiClient.get(`/leaves?${params.toString()}`);
      // Return only the array, not the whole response object
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch leave entries:', error);
      throw error;
    }
  },

  /**
   * Create a new leave entry
   */
  async createLeave(leaveData: CreateLeaveDto): Promise<LeaveEntry> {
    try {
      return await apiClient.post<LeaveEntry>('/leaves', leaveData);
    } catch (error) {
      console.error('Failed to create leave entry:', error);
      throw error;
    }
  },

  /**
   * Delete a leave entry
   */
  async deleteLeave(leaveId: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.delete<{ success: boolean }>(`/leaves/${leaveId}`);
    } catch (error) {
      console.error(`Failed to delete leave entry ${leaveId}:`, error);
      throw error;
    }
  },

  /**
   * Check if a date is marked as leave
   */
  async isLeaveDate(date: Date): Promise<boolean> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const leaves = await this.getLeaves({ startDate: dateStr, endDate: dateStr });
      return leaves.length > 0;
    } catch (error) {
      console.error('Failed to check leave date:', error);
      return false;
    }
  },
};

export interface WorkingDaysConfig {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  holidays: string[]; // Array of dates in 'YYYY-MM-DD' format
}

export const workingDaysService = {
  /**
   * Get working days configuration
   */
  async getConfig(): Promise<WorkingDaysConfig> {
    try {
      const response = await apiClient.get<{ data: WorkingDaysConfig; isDefault: boolean }>('/working-days');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch working days configuration:', error);
      // Return default configuration if there's an error
      return {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        holidays: [],
      };
    }
  },

  /**
   * Update working days configuration
   */
  async updateConfig(config: Partial<WorkingDaysConfig>): Promise<WorkingDaysConfig> {
    try {
      const response = await apiClient.put<{ data: WorkingDaysConfig }>('/working-days', config);
      return response.data;
    } catch (error) {
      console.error('Failed to update working days configuration:', error);
      throw error;
    }
  },

  /**
   * Check if a date is a working day (not a weekend or holiday)
   */
  async isWorkingDay(date: Date): Promise<boolean> {
    try {
      const config = await this.getConfig();
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if it's a holiday
      if (config.holidays.includes(dateStr)) {
        return false;
      }
      
      // Check if it's a working day based on the configuration
      switch (dayOfWeek) {
        case 0: return config.sunday;
        case 1: return config.monday;
        case 2: return config.tuesday;
        case 3: return config.wednesday;
        case 4: return config.thursday;
        case 5: return config.friday;
        case 6: return config.saturday;
        default: return false;
      }
    } catch (error) {
      console.error('Failed to check working day:', error);
      // Default to Monday-Friday working week if there's an error
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
  },

  /**
   * Get the next working day from a given date
   */
  async getNextWorkingDay(fromDate: Date = new Date()): Promise<Date> {
    const date = new Date(fromDate);
    date.setDate(date.getDate() + 1); // Start from the next day
    
    // Try up to 365 days in the future to avoid infinite loops
    for (let i = 0; i < 365; i++) {
      if (await this.isWorkingDay(date)) {
        return date;
      }
      date.setDate(date.getDate() + 1);
    }
    
    // If no working day found (unlikely), return the original date + 1 day
    return date;
  },

  /**
   * Get the previous working day from a given date
   */
  async getPreviousWorkingDay(fromDate: Date = new Date()): Promise<Date> {
    const date = new Date(fromDate);
    date.setDate(date.getDate() - 1); // Start from the previous day
    
    // Try up to 365 days in the past to avoid infinite loops
    for (let i = 0; i < 365; i++) {
      if (await this.isWorkingDay(date)) {
        return date;
      }
      date.setDate(date.getDate() - 1);
    }
    
    // If no working day found (unlikely), return the original date - 1 day
    return date;
  },
};
