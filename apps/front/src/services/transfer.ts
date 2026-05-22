import {
  APP_ROUTES,
  type PaginatedLogs,
  type TransferBalanceDto,
} from "@intern/factory";

import { Service } from "./_base";

export class TransferService extends Service {
  public transferBalance(data: TransferBalanceDto) {
    return this.fetch<{ message: string }>({
      url: APP_ROUTES.BACKEND.TRANSFER.BASE,
      method: "POST",
      data,
      expectedStatusCode: 200,
    });
  }

  public getAllLogs(
    page: number,
    limit: number,
    search?: string,
    startDate?: string,
    endDate?: string,
  ) {
    return this.fetch<PaginatedLogs>({
      url: APP_ROUTES.BACKEND.TRANSFER.LOGS,
      method: "GET",
      params: { page, limit, search, startDate, endDate },
      expectedStatusCode: 200,
    });
  }

  public getUserLogs(
    userId: number,
    page: number,
    limit: number,
    search?: string,
    startDate?: string,
    endDate?: string,
  ) {
    return this.fetch<PaginatedLogs>({
      url: APP_ROUTES.BACKEND.TRANSFER.LOGS_USER(userId),
      method: "GET",
      params: { page, limit, search, startDate, endDate },
      expectedStatusCode: 200,
    });
  }
}
