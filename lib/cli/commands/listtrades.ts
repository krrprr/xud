import { Arguments } from 'yargs';
import { callback, loadXudClient } from '../command';
import { ListTradesRequest } from '../../proto/xudrpc_pb';

export const command = 'listtrades [limit]';

export const describe = 'list completed trades';

export const builder = {
  limit: {
    description: 'whether to return all trades',
    type: 'number',
    default: 15,
  },
};

export const handler = (argv: Arguments) => {
  const request = new ListTradesRequest();
  request.setLimit(argv.limit);
  loadXudClient(argv).listTrades(request, callback(argv));
};
