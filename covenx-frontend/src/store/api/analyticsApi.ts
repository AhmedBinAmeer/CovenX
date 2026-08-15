import { baseApi } from './baseApi.js';
import { ExecutiveMetrics, ApiResponse } from '../../types/contract.types.js';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExecutiveMetrics: builder.query<ExecutiveMetrics, void>({
      query: () => '/analytics/dashboard',
      transformResponse: (response: ApiResponse<ExecutiveMetrics>) => response.data,
      providesTags: ['Analytics'],
    }),
  }),
});

export const { useGetExecutiveMetricsQuery } = analyticsApi;
