import fs from 'fs';
import path from 'path';
import { removeSync } from 'fs-extra';
import Backup from '../../lib/backup/Backup';

const backupdir = 'backup-test';

const raidenDatabase = 'raiden';

const channelBackup = {
  lnd: {
    event: 'lnd event',
    startup: 'lnd startup',
  },
  raiden: {
    event: 'raiden event',
    startup: 'raiden startup',
  },
};

let channelBackupCallback: any;

const onListenerMock = jest.fn((event, callback) => {
  expect(event).toEqual('channelBackup');

  channelBackupCallback = callback;
});

jest.mock('../../lib/lndclient/LndClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: onListenerMock,
      currency: 'BTC',
      init: () => Promise.resolve(),
      close: () => Promise.resolve(),
      subscribeChannelBackups: () => Promise.resolve(),
      exportAllChannelBackup: () => Promise.resolve(channelBackup.lnd.startup),
    };
  });
});

describe('Backup', () => {
  const backup = new Backup();

  beforeAll(async () => {
    fs.writeFileSync(
      raidenDatabase,
      channelBackup.raiden.startup,
    );

    await backup.start({
      backupdir,
      loglevel: 'error',
      raiden: {
        database: raidenDatabase,
      },
    });
  });

  test('should resolve backup directory', () => {
    expect(backup['getDefaultBackupDir']()).toContainEqual('/');
  });

  test('should write LND backups on startup', () => {
    expect(
      fs.readFileSync(
        path.join(backupdir, 'lnd-BTC'),
        'utf-8',
      ),
    ).toEqual(channelBackup.lnd.startup);
  });

  test('should write LND backups on new event', () => {
    expect(onListenerMock).toBeCalledTimes(2);

    channelBackupCallback(channelBackup.lnd.event);

    expect(
      fs.readFileSync(
        path.join(backupdir, 'lnd-BTC'),
        'utf-8',
      ),
    ).toEqual(channelBackup.lnd.event);
  });

  test('should write Raiden backups on startup', () => {
    expect(
      fs.readFileSync(
        path.join(backupdir, 'raiden'),
        'utf-8',
      ),
    ).toEqual(channelBackup.raiden.startup);
  });

  test('should write Raiden backups on new event', async () => {
    fs.writeFileSync(
      raidenDatabase,
      channelBackup.raiden.event,
    );

    // Wait 100ms to make sure the file watcher handled the new file
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(
      fs.readFileSync(
        path.join(backupdir, 'raiden'),
        'utf-8',
      ),
    ).toEqual(channelBackup.raiden.event);
  });

  afterAll(async () => {
    await backup.stop();

    removeSync(backupdir);
    fs.unlinkSync(raidenDatabase);
  });
});
