import { baseApi } from './baseApi.js';
import { IContract, ApiResponse } from '../../types/contract.types.js';

export const contractsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContracts: builder.query<IContract[], { status?: string; type?: string; department?: string; search?: string } | void>({
      query: (params) => ({
        url: '/contracts',
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<IContract[]>) => response.data || [],
      providesTags: ['Contracts'],
    }),

    getContractById: builder.query<IContract, string>({
      query: (id) => `/contracts/${id}`,
      transformResponse: (response: ApiResponse<IContract>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Contract', id }],
    }),

    createContract: builder.mutation<IContract, Partial<IContract>>({
      query: (body) => ({
        url: '/contracts',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<IContract>) => response.data,
      invalidatesTags: ['Contracts', 'Analytics'],
    }),

    updateContentAndVersion: builder.mutation<IContract, { id: string; title: string; content: string; changeSummary?: string }>({
      query: ({ id, ...body }) => ({
        url: `/contracts/${id}/content`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<IContract>) => response.data,
      invalidatesTags: (result, error, { id }) => ['Contracts', { type: 'Contract', id }, 'AuditLogs'],
    }),

    submitForApproval: builder.mutation<IContract, string>({
      query: (id) => ({
        url: `/contracts/${id}/submit`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<IContract>) => response.data,
      invalidatesTags: (result, error, id) => ['Contracts', { type: 'Contract', id }, 'Analytics'],
    }),

    approveStep: builder.mutation<IContract, { id: string; step: number; comments?: string }>({
      query: ({ id, ...body }) => ({
        url: `/contracts/${id}/approve`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<IContract>) => response.data,
      invalidatesTags: (result, error, { id }) => ['Contracts', { type: 'Contract', id }, 'Analytics', 'AuditLogs'],
    }),

    signContract: builder.mutation<IContract, { id: string; signerName: string; signerEmail: string }>({
      query: ({ id, ...body }) => ({
        url: `/contracts/${id}/sign`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<IContract>) => response.data,
      invalidatesTags: (result, error, { id }) => ['Contracts', { type: 'Contract', id }, 'Analytics', 'AuditLogs'],
    }),

    addObligation: builder.mutation<IContract, { id: string; title: string; ownerName: string; dueDate: string; type: string; description?: string }>({
      query: ({ id, ...body }) => ({
        url: `/contracts/${id}/obligations`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<IContract>) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Contract', id }, 'AuditLogs'],
    }),
  }),
});

export const {
  useGetContractsQuery,
  useGetContractByIdQuery,
  useCreateContractMutation,
  useUpdateContentAndVersionMutation,
  useSubmitForApprovalMutation,
  useApproveStepMutation,
  useSignContractMutation,
  useAddObligationMutation,
} = contractsApi;
