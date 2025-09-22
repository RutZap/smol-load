import { RouteFunction, models } from '@teamkeel/sdk';

const handler: RouteFunction = async (request, ctx) => {
  try {
    const body = request.body ?? ''; // Handle empty body for webhook test method
    const jsonBody = JSON.parse(body);
  
    const rechargeId = jsonBody?.order?.id ?? null;
      
    await models.rechargeOrdersWebhook.create({ body: body, rechargeId: rechargeId });
    return {
      body: JSON.stringify({
        message: 'Webhook successfully received',
      }),
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.log(error);
    return {
      body: JSON.stringify({
        message: 'Unknown internal error',
      }),
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

export default handler;
