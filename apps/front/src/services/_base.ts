import type { AxiosResponse } from "axios";

export interface IFetchOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: unknown;
  params?: unknown;
  expectedStatusCode: number | number[];
  revoke?: boolean;
  noAuth?: boolean;
  headers?: Record<string, string>;
  endpoint?: string;
}

export class Service {
  public async fetch<T>(
    _fetchOption: IFetchOptions,
  ): Promise<AxiosResponse<T>> {
    return {} as AxiosResponse<T>;
  }
}
