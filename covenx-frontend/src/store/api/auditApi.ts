import { baseApi } from './baseApi.js';
import { IAuditLog, ApiResponse } from '../../types/contract.types.js';

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<IAuditLog[], string | void>({
      query: (contractId) => ({
        url: '/audit-logs',
        params: contractId ? { contractId } : {},
      }),
      transformResponse: (response: ApiResponse<IAuditLog[]>) => response.data || [],
      providesTags: ['AuditLogs'],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
