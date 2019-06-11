import fs from 'fs';
import os from 'os';
import path from 'path';
import { createHash } from 'crypto';
import Config from '../Config';
import Logger, { Context } from '../Logger';
import LndClient from '../lndclient/LndClient';

class Backup {
  private logger!: Logger;
  private config = new Config();

  private backupDir!: string;

  private fileWatcher!: fs.FSWatcher;
  private lndClients: LndClient[] = [];

  public start = async (args: { [argName: string]: any }) => {
    await this.config.load(args);

    this.backupDir = args.backupdir || this.getDefaultBackupDir();

    this.logger = new Logger({
      context: Context.Backup,
      level: this.config.loglevel,
      filename: this.config.logpath,
      instanceId: this.config.instanceid,
      dateFormat: this.config.logdateformat,
    });

    if (!fs.existsSync(this.backupDir)) {
      try {
        fs.mkdirSync(this.backupDir);
      } catch (error) {
        this.logger.error(`Could not create backup directory: ${error}`);
        return;
      }
    }

    // Start the LND SCB subscriptions
    for (const currency in this.config.lnd) {
      const lndConfig = this.config.lnd[currency]!;

      // Ignore the LND client if it is disabled or not configured
      if (!lndConfig.disable && Object.entries(lndConfig).length !== 0) {
        const lndClient = new LndClient(
          lndConfig,
          currency,
          Logger.DISABLED_LOGGER,
        );

        this.lndClients.push(lndClient);

        await lndClient.init();

        this.logger.verbose(`Writing initial ${lndClient.currency} LND channel backup`);

        const channelBackup = await lndClient.exportAllChannelBackup();
        this.writeLndBackup(lndClient.currency, channelBackup);

        this.listenToChannelBackups(lndClient);

        lndClient.subscribeChannelBackups();
        this.logger.verbose(`Listening to ${currency} LND channel backups`);
      }
    }

    // Start the Raiden database filewatcher
    if (args.raiden) {
      const raidenDb = args.raiden.database;

      if (fs.existsSync(raidenDb)) {
        let previousRaidenMd5 = '';

        this.logger.verbose('Writing initial Raiden database backup');
        const { content, hash } = this.readRaidenDatabase(raidenDb);

        previousRaidenMd5 = hash;
        this.writeBackup('raiden', content);

        this.fileWatcher = fs.watch(raidenDb, { persistent: true, recursive: false }, (event: string) => {
          if (event === 'change') {
            const { content, hash } = this.readRaidenDatabase(raidenDb);

            // Compare the MD5 hash of the current content of the file with hash of the content when
            // it was backed up the last time to ensure that the content of the file has changed
            if (hash !== previousRaidenMd5) {
              this.logger.debug('Raiden database changed');

              previousRaidenMd5 = hash;
              this.writeBackup('raiden', content);
            }
          }
        });

        this.logger.verbose('Listening for changes to the Raiden database');
      } else {
        this.logger.error(`Could not find database file of Raiden: ${raidenDb}`);
      }
    } else {
      this.logger.warn('Raiden database file not specified');
    }

    this.logger.info('Started backup daemon');
  }

  public stop = async () => {
    this.fileWatcher.close();

    for (const lndClient of this.lndClients) {
      await lndClient.close();
    }
  }

  private listenToChannelBackups = (lndClient: LndClient) => {
    lndClient.on('channelBackup', (channelBackup) => {
      this.logger.debug(`New ${lndClient.currency} channel backup`);
      this.writeLndBackup(lndClient.currency, channelBackup);
    });
  }

  private readRaidenDatabase = (path: string): { content: string, hash: string } => {
    const content = fs.readFileSync(path);

    return {
      content: content.toString('utf-8'),
      hash: createHash('md5').update(content).digest('base64'),
    };
  }

  private writeLndBackup = (currency: string, channelBackup: string) => {
    this.writeBackup(`lnd-${currency}`, channelBackup);
  }

  private writeBackup = (fileName: string, data: string) => {
    try {
      fs.writeFileSync(
        path.join(this.backupDir, fileName),
        data,
      );
    } catch (error) {
      this.logger.error(`Could not write backup file: ${error}`);
    }
  }

  private getDefaultBackupDir = () => {
    switch (os.platform()) {
      case 'win32':
        return path.join(process.env.LOCALAPPDATA!, 'Xud Backup');
      default:
        return path.join(process.env.HOME!, '.xud-backup');
    }
  }
}

export default Backup;
