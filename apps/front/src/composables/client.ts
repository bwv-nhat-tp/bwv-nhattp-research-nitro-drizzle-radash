import { APP_CONFIG } from "@intern/factory";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { inject, provide, reactive, type Ref, ref } from "vue";

import type { IFetchOptions } from "@/services/_base";
import { API_CLIENT } from "@/symbols";

export abstract class AbstractApiClient {
  abstract fetch<T>(fetchOption: IFetchOptions): Promise<AxiosResponse<T>>;
}

const isExpectedStatus = (status: number, expected: number | number[]) =>
  Array.isArray(expected) ? expected.includes(status) : status === expected;

export const useApiClient = () => {
  class ApiClient extends AbstractApiClient {
    public async fetch<T>(
      fetchOption: IFetchOptions,
    ): Promise<AxiosResponse<T>> {
      const headers: Record<string, string> = { ...fetchOption.headers };
      const token = localStorage.getItem("accessToken");

      if (fetchOption.noAuth !== true && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const axiosOption: AxiosRequestConfig = {
        baseURL: fetchOption.endpoint ?? APP_CONFIG.API_BASE_URL,
        url: fetchOption.url,
        method: fetchOption.method ?? "GET",
        data: fetchOption.data,
        params: fetchOption.params,
        headers,
        withCredentials: true,
        validateStatus: (status) =>
          isExpectedStatus(status, fetchOption.expectedStatusCode),
      };

      return axios<T>(axiosOption);
    }
  }

  provide(API_CLIENT, new ApiClient());
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

export function useLazyQuery<
  Q extends (...args: any[]) => Promise<{ data: any; count?: number }>,
>(fetcher: Q, ...params: Partial<Parameters<Q>>) {
  const isLoading = ref(false);
  const result: {
    count: number;
    data: AsyncReturnType<Q>["data"] | null;
  } = reactive({ count: 0, data: null });
  const error: Ref<any> = ref(null);
  const client = inject<AbstractApiClient>(API_CLIENT)!;

  async function refetch(...newParams: Partial<Parameters<Q>>) {
    error.value = null;
    isLoading.value = true;
    try {
      const args = newParams.length ? newParams : params;
      const apiResult = await fetcher.bind(client)(...(args as Parameters<Q>));
      result.data = apiResult.data;
      result.count = apiResult.count ?? 0;
    } catch (err) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  return { result, refetch, isLoading, error };
}

export function useQuery<
  Q extends (...args: any[]) => Promise<{ data: any; count?: number }>,
>(fetcher: Q, ...params: Parameters<Q>) {
  const query = useLazyQuery(fetcher, ...params);
  query.refetch(...params);

  return query;
}

export function useMutation<
  Q extends (...args: any[]) => Promise<{ data: any }>,
>(mutator: Q, ...params: Partial<Parameters<Q>>) {
  const isLoading = ref(false);
  const result: Ref<AsyncReturnType<Q>["data"] | null> = ref(null);
  const error: Ref<any> = ref(null);
  const client = inject<AbstractApiClient>(API_CLIENT)!;

  const mutate = async (...newParams: Partial<Parameters<Q>>) => {
    isLoading.value = true;
    error.value = null;
    try {
      const args = newParams.length ? newParams : params;
      const apiResult = await mutator.bind(client)(...(args as Parameters<Q>));
      result.value = apiResult.data;
    } catch (err) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }

    return result.value;
  };

  return { result, mutate, isLoading, error };
}
