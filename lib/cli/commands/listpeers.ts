import { callback, loadXudClient } from '../command';
import { Arguments } from 'yargs';
import colors from 'colors/safe';
import Table, { HorizontalTable } from 'cli-table3';
import { generateHeaders } from '../utils';
import { ListPeersRequest, ListPeersResponse, Peer } from '../../proto/xudrpc_pb';

const HEADERS = [
  'address',
  'public key',
  'inbound',
  'xud version',
  'uptime',
  'pairs list',
  'lnd public keys',
  'raiden address',
];

const createTable = () => {
  const table = new Table({
    head: generateHeaders(HEADERS),
  }) as HorizontalTable;
  return table;
};

const trimPubKey = (key: string) => {
  if (key.length <= 0) {
    return '';
  }
  return `${key.slice(0, 6)}...`;
};

const formatPairList = (pairs: string[]) => {
  let pairString = '';
  pairs.forEach((pair) => {
    pairString = pairString + `\n ${pair}`;
  });
  return pairString;
};

const formatLndPubKeys = (lndKeys: string[][]) => {
  let str = '';
  lndKeys.forEach((client) => {
    str =  str + `\n ${client[0]} ${trimPubKey(client[1])}`;
  });
  return str;
};

const formatPeers = (peers: ListPeersResponse.AsObject) => {
  const formattedPeers: string[][] = [];
  peers.peersList.forEach((peer: Peer.AsObject) => {
    formattedPeers.push([
      peer.address,
      trimPubKey(peer.nodePubKey),
      `${peer.inbound}`,
      peer.xudVersion,
      `${peer.secondsConnected.toString()} seconds`,
      formatPairList(peer.pairsList),
      formatLndPubKeys(peer.lndPubKeysMap),
      trimPubKey(peer.raidenAddress),
    ]);
  });
  return formattedPeers;
};

const displayTables = (peers: ListPeersResponse.AsObject) => {
  const table = createTable();
  formatPeers(peers).forEach((peer) => {
    table.push(peer);
  });
  console.log(colors.underline(colors.bold('\nPeers:')));
  console.log(table.toString());
};

export const command = 'listpeers';

export const describe = 'list connected peers';

export const handler = (argv: Arguments) => {
  loadXudClient(argv).listPeers(new ListPeersRequest(), callback(argv, displayTables));
};
