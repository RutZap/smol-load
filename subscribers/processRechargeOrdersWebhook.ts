import { ProcessRechargeOrdersWebhook, models, RechargeOrdersWebhookStatus } from '@teamkeel/sdk';
import { upsertOrders } from '../lib/recharge/helpers/upsertOrders';

export default ProcessRechargeOrdersWebhook(async (ctx, event) => {
  const body = JSON.parse(event.target.data.body);
  // If webhook is missing order ...something has gone wrong, or the wrong webhook has been received to the orders endpoint
  const order = body?.order ?? null;
  if (!order) {
    const errorMessage = 'Webhook body missing order object';
    await models.rechargeOrdersWebhook.update(
      { id: event.target.data.id },
      { status: RechargeOrdersWebhookStatus.Error, errorMessage: errorMessage }
    );
    return;
  }
  // If object ID is missing ...something has gone wrong
  const rechargeId = order.id;
  if (!rechargeId) {
    const errorMessage = 'Order ID not found in response body';
    await models.rechargeOrdersWebhook.update(
      { id: event.target.data.id },
      { status: RechargeOrdersWebhookStatus.Error, errorMessage: errorMessage }
    );
    return;
  }
  // If webhook has already been received - mark this object as Duplicate
  const existingWebhooks = await models.rechargeOrdersWebhook.findMany({
    where: {
      body: {
        contains: `"id": ${rechargeId},`,
      },
    },
  });
  if (existingWebhooks?.length > 1) {
    const errorMessage = 'Webhook already received';
    await models.rechargeOrdersWebhook.update(
      { id: event.target.data.id },
      { status: RechargeOrdersWebhookStatus.Duplicate, errorMessage: errorMessage }
    );
    return;
  }
  // Attempt to upsert orders data
  try {
    await upsertOrders([order]);
    const errorMessage = '';
    await models.rechargeOrdersWebhook.update(
      { id: event.target.data.id },
      {
        status: RechargeOrdersWebhookStatus.Processed,
        errorMessage: errorMessage,
        processedAt: ctx.now(),
      }
    );
    return;
  } catch (error) {
    console.log(error);
    await models.rechargeOrdersWebhook.update(
      { id: event.target.data.id },
      { status: RechargeOrdersWebhookStatus.Error, errorMessage: error }
    );
  }
});
