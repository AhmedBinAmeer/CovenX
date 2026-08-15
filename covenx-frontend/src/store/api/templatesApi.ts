import { baseApi } from './baseApi.js';
import { ITemplate, IClause, ApiResponse } from '../../types/contract.types.js';

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<ITemplate[], void>({
      query: () => '/templates',
      transformResponse: (response: ApiResponse<ITemplate[]>) => response.data || [],
      providesTags: ['Templates'],
    }),

    getClauses: builder.query<IClause[], void>({
      query: () => '/clauses',
      transformResponse: (response: ApiResponse<IClause[]>) => response.data || [],
      providesTags: ['Clauses'],
    }),

    createClause: builder.mutation<IClause, Partial<IClause>>({
      query: (body) => ({
        url: '/clauses',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<IClause>) => response.data,
      invalidatesTags: ['Clauses'],
    }),
  }),
});

export const { useGetTemplatesQuery, useGetClausesQuery, useCreateClauseMutation } = templatesApi;
