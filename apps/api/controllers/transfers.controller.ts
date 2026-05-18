import { InferType } from 'yup';
import { baseTransferSchema, SUCCESS_MESSAGES } from '@intern/factory';
import { TransferLogRepository } from '@intern/domain';
import BaseController from './_base';

class TransfersController extends BaseController {
  public create = this.define(async (event) => {
    const userContext = this.getAuthUser(event);
    const body = this.getValidatedBody<InferType<typeof baseTransferSchema>>(event);

    await TransferLogRepository.transferBalance(
      userContext.id,
      body.toUserId,
      body.amount,
    );

    return this.ok(event, { rows: { message: SUCCESS_MESSAGES.TRANSFER } });
  });

  public logs = this.define(async (event) => {
    const filters = {
      ...this.getPagination(event),
      startDate: this.getQueryString(event, 'startDate'),
      endDate: this.getQueryString(event, 'endDate'),
      search: this.getQueryString(event, 'search'),
    };

    return this.ok(event, { rows: await TransferLogRepository.findLogs(filters) });
  });

  public userLogs = this.define(async (event) => {
    const filters = {
      ...this.getPagination(event),
      startDate: this.getQueryString(event, 'startDate'),
      endDate: this.getQueryString(event, 'endDate'),
      search: this.getQueryString(event, 'search'),
      userId: this.getNumberParam(event, 'userId'),
    };

    return this.ok(event, { rows: await TransferLogRepository.findLogs(filters) });
  });
}

export const transfersController = new TransfersController();
