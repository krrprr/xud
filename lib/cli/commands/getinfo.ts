import { callback, loadXudClient } from '../command';
import { Arguments } from 'yargs';
import Table, { VerticalTable } from 'cli-table3';
import colors from 'colors/safe';
import { GetInfoRequest, GetInfoResponse, LndInfo } from '../../proto/xudrpc_pb';

type generalInfo = {
  version: string;
  numPeers: number;
  numPairs: number;
  nodePubKey: string;
};

const displayChannels = (channels: any, asset: string) => {
  const table = new Table() as VerticalTable;
  Object.keys(channels).forEach((key: any) => {
    table.push({
      [colors.blue(key)] : channels[key],
    });
  });
  console.log(colors.underline(colors.bold(`\nLnd ${asset} channels:`)));
  console.log(table.toString(), '\n');
};

const displayChainsList = (list: any[], asset: string) => {
  const table = new Table() as VerticalTable;
  list.forEach((asset, i) => {
    table.push({ [colors.blue(`${i + 1}.`)] : asset });
  });
  console.log(colors.underline(colors.bold(`\nLnd ${asset} chains:`)));
  console.log(table.toString(), '\n');
};

const displayUriList = (uris: string[], asset: string) => {
  const table = new Table() as VerticalTable;
  uris.forEach((uri, i) => table.push({ [`${i + 1}.`]: uri }));
  console.log(colors.underline(colors.bold(`\nLnd ${asset} uris:`)));
  console.log(table.toString(), '\n');
};

const displayLndInfo = (asset: string, info: LndInfo.AsObject) => {
  const basicInfotable = new Table() as VerticalTable;
  basicInfotable.push(
    { [colors.blue('Error')]: info.error },
    { [colors.blue('Block Height')]: info.blockheight },
    { [colors.blue('Version')]: info.version },
    { [colors.blue('Alias')]: info.alias },
  );
  console.log(colors.underline(colors.bold(`\nLnd ${asset} info:`)));
  console.log(basicInfotable.toString(), '\n');

  if (info.channels) {
    displayChannels(info.channels, asset);
  }

  displayChainsList(info.chainsList, asset);

  if (info.urisList.length > 0) {
    displayUriList(info.urisList, asset);
  }
};

const displayGeneral = (info: generalInfo) => {
  const table = new Table() as VerticalTable;
  table.push(
    { [colors.blue('Version')]: info.version },
    { [colors.blue('Pairs')]: info.numPairs },
    { [colors.blue('Peers')]: info.numPeers },
    { [colors.blue('Pubic key')]: info.nodePubKey },
  );
  console.log(colors.underline(colors.bold('\nGeneral XUD Info')));
  console.log(table.toString(), '\n');
};

const displayOrders = (orders: {own: number, peer: number}) => {
  const table = new Table() as VerticalTable;
  table.push(
    { [colors.blue('Own orders')]: orders.own },
    { [colors.blue('Peer orders')]: orders.peer },
  );
  console.log(colors.underline(colors.bold('\nOrders:')));
  console.log(table.toString(), '\n');
};

const displayGetInfo = (request: GetInfoResponse.AsObject) => {
  displayGeneral({
    nodePubKey: request.nodePubKey,
    numPairs: request.numPairs,
    numPeers: request.numPeers,
    version: request.version,
  });
  if (request.orders) {
    displayOrders({
      own: request.orders.own,
      peer: request.orders.peer,
    });
  }
  request.lndMap.forEach(asset =>   displayLndInfo(asset[0], asset[1]));
};

export const command = 'getinfo';

export const describe = 'get general info from the xud node';

export const handler = (argv: Arguments) => {
  loadXudClient(argv).getInfo(new GetInfoRequest(), callback(argv, displayGetInfo));
};
