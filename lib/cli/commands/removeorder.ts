import { callback, loadXudClient } from '../command';
import { Arguments } from 'yargs';
import { RemoveOrderRequest, RemoveOrderResponse } from '../../proto/xudrpc_pb';
import { SATOSHIS_PER_COIN } from '../utils';
import Table, { VerticalTable } from 'cli-table3';
import colors from 'colors/safe';

const displayRemoveOrder = (res: RemoveOrderResponse.AsObject) => {
  const table = new Table() as VerticalTable;
  const quantityOnHold = colors.red('Quantity on hold');
  table.push({ [quantityOnHold]: res.quantityOnHold });
  console.log(colors.underline(colors.bold('\nOrder removed:')));
  console.log(table.toString());
};

export const command = 'removeorder <order_id> [quantity]';

export const describe = 'remove an order';

export const builder = {
  order_id: {
    type: 'string',
  },
  quantity: {
    type: 'number',
    describe: 'quantity to remove, if zero or unspecified the entire order is removed',
  },
};

export const handler = (argv: Arguments) => {
  const request = new RemoveOrderRequest();
  request.setOrderId(argv.order_id);
  if (argv.quantity) {
    request.setQuantity(argv.quantity * SATOSHIS_PER_COIN);
  }
  loadXudClient(argv).removeOrder(request, callback(argv));
};
