import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { Job } from '../../types';

export const jobService = {
  getAllJobs: async () => {
    return apiClient.get<Job[]>(ENDPOINTS.JOBS.BASE);
  },

  getJobById: async (id: string) => {
    return apiClient.get<Job>(ENDPOINTS.JOBS.BY_ID(id));
  },

  createJob: async (jobData: Partial<Job>) => {
    return apiClient.post<Job>(ENDPOINTS.JOBS.BASE, jobData);
  },

  updateJob: async (id: string, jobData: Partial<Job>) => {
    return apiClient.put<Job>(ENDPOINTS.JOBS.BY_ID(id), jobData);
  },

  deleteJob: async (id: string) => {
    return apiClient.delete<void>(ENDPOINTS.JOBS.BY_ID(id));
  },
};
