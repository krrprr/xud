import { Arguments } from 'yargs';
import { callback, loadXudClient } from '../command';
import { ListTradesRequest, ListTradesResponse, Trade } from '../../proto/xudrpc_pb';
import Table, { HorizontalTable } from 'cli-table3';
import colors from 'colors/safe';

const HEADERS = [
  colors.blue('rhash'),
  colors.blue('trade quantity'),
  colors.blue('trading pair'),
  colors.blue('order type'),
];

const displayTrades = (trades: ListTradesResponse.AsObject) => {
  const table = new Table({ head: HEADERS }) as HorizontalTable;
  trades.tradesList.forEach((trade: Trade.AsObject) => {
    const type = trade.makerOrder ? 'maker' : 'taker';
    table.push([
      trade.rHash,
      trade.quantity,
      trade.pairId,
      type,
    ]);
  });
  console.log(colors.underline(colors.bold('\Trades:')));
  console.log(table.toString());
};

export const command = 'listtrades [limit]';

export const describe = 'list completed trades';

export const builder = {
  limit: {
    description: 'the maximum number of trades to display',
    type: 'number',
    default: 15,
  },
};

export const handler = (argv: Arguments) => {
  const request = new ListTradesRequest();
  request.setLimit(argv.limit);
  loadXudClient(argv).listTrades(request, callback(argv, displayTrades));
};
