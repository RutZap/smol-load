import { Identity, OrderTask, useDatabase, OrderTaskType, OrderTaskStatus } from '@teamkeel/sdk';

export async function getAssignPickPackDispatchTask(identity: Identity): Promise<OrderTask | null> {
  const db = useDatabase();
  return db.transaction().execute(async trx => {
    // Find next Open orderTask
    // Lock row for transaction
    // Skip currently locked rows
    const orderTask = await trx
      .selectFrom('order_task')
      .selectAll()
      .where('status', '=', OrderTaskStatus.Open)
      .where('type', '=', OrderTaskType.PickPackDispatch)
      .where('deferredUntil', '<=', new Date(Date.now()))
      .orderBy('createdAt', 'asc')
      .limit(1)
      .forUpdate()
      .skipLocked()
      .executeTakeFirst();
    // Return early if no orderTask found
    if (!orderTask) return null;
    // Set status to assigned - after transaction will prevent other users picking this up
    // Set assigned user and time - to track "stuck" tasks and re-open them
    const assignTask = await trx
      .updateTable('order_task')
      .set(eb => ({
        status: OrderTaskStatus.Assigned,
        assignedToId: identity.id,
        assignedAt: new Date(Date.now()),
      }))
      .where('id', '=', orderTask.id)
      .returningAll()
      .executeTakeFirst();

    return orderTask;
  });
}
