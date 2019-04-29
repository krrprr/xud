import { callback, loadXudClient } from '../command';
import { Arguments } from 'yargs';
import Table, { HorizontalTable } from 'cli-table3';
import colors from 'colors/safe';
import { ListPeersRequest, ListPeersResponse } from '../../proto/xudrpc_pb';

const HEADERS = [
  colors.red('address'),
  colors.red('node public key'),
  colors.red('lnd public keys'),
  colors.red('inbound'),
  colors.red('pairs list'),
  colors.red('xud version'),
  colors.red('seconds connected'),
  colors.red('raiden address'),
];

const createTable = () => {
  const table = new Table({
    head: HEADERS,
  }) as HorizontalTable;
  return table;
};

const formatPeers = (peers: ListPeersResponse.AsObject) => {
  const formattedPeers: string[][] = [];
  peers.peersList.forEach((peer) => {
    const peerInfo: string[] = [];
    Object.keys(peer).forEach(key => peerInfo.push(`${peer[key]}`));
    console.log(peerInfo);
    formattedPeers.push(peerInfo);
  });
  return formattedPeers;
};

const displayTables = (peers: ListPeersResponse.AsObject) => {
  const table = createTable();
  formatPeers(peers).forEach((peer) => {
    table.push(peer);
  });
  console.log(table.toString());
};

export const command = 'listpeers';

export const describe = 'list connected peers';

export const handler = (argv: Arguments) => {
  loadXudClient(argv).listPeers(new ListPeersRequest(), callback(argv, displayTables));
};
