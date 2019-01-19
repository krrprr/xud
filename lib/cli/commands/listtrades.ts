import { Arguments } from 'yargs';
import { callback, loadXudClient } from '../command';
import { ListTradesRequest } from '../../proto/xudrpc_pb';

export const command = 'listtrades [all]';

export const describe = 'list all trades';

export const builder = {
  existing: {
    description: 'should return all trades',
    type: 'boolean',
    default: false,
  },
};

export const handler = (argv: Arguments) => {
  const request = new ListTradesRequest();
  request.setAll(argv.all);
  loadXudClient(argv).listTrades(request, callback(argv));
};
