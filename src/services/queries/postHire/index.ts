import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import type {
  PostHireHiresResponse,
  SubmitCheckInDto,
  SetBenchmarksDto,
} from './types';

export * from './types';

export const postHireKeys = {
  all: ['post-hire'] as const,
  hires: () => [...postHireKeys.all, 'hires'] as const,
  jobHires: (rolePostingId: string) => [...postHireKeys.all, 'jobs', rolePostingId, 'hires'] as const,
};

export const usePostHireHiresQuery = () => {
  return useQuery({
    queryKey: postHireKeys.hires(),
    queryFn: async () => {
      const res = await apiClient.get<{ data: PostHireHiresResponse }>({
        url: '/post-hire/hires',
        auth: true,
      });
      return res.data;
    },
  });
};

export const useSubmitCheckInMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      checkInId,
      body,
    }: {
      checkInId: string;
      body: SubmitCheckInDto;
    }) =>
      apiClient.post<any>({
        url: `/post-hire/check-ins/${checkInId}/submit`,
        body,
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postHireKeys.all });
    },
  });
};

export const useSetBenchmarksMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      hireId,
      body,
    }: {
      hireId: string;
      body: SetBenchmarksDto;
    }) =>
      apiClient.post<any>({
        url: `/post-hire/${hireId}/benchmarks`,
        body,
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postHireKeys.all });
    },
  });
};
