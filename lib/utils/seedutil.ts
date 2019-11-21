import { exec as childProcessExec } from 'child_process';
import { promisify } from 'util';

/** A promisified wrapped for the NodeJS `child_process.exec` method. */
const exec = promisify(childProcessExec);

/**
 * Executes the seedutil tool to generate an ethereum keystore from the given
 * mnemonic and password at the specified path.
 * @param mnemonic the 24 seed recovery mnemonic
 * @param password the password to protect the keystore
 * @param path the path in which to create the keystore directory
 */
async function keystore(mnemonic: string[], password: string, path: string) {
  const { stdout, stderr } = await exec(`./seedutil/seedutil keystore -pass=${password} -path=${path} ${mnemonic.join(' ')}`);

  if (stderr) {
    throw new Error(stderr);
  }

  if (!stdout.includes('Keystore created')) {
    throw new Error(stdout);
  }
}

/**
 * Executes the seedutil tool to encipher a seed mnemonic into bytes.
 * @param mnemonic the 24 seed recovery mnemonic
 */
async function encipher(mnemonic: string[]) {
  const { stdout, stderr } = await exec(`./seedutil/seedutil encipher ${mnemonic.join(' ')}`);

  if (stderr) {
    throw new Error(stderr);
  }

  const encipheredSeed = stdout.trim();
  return Buffer.from(encipheredSeed, 'hex');
}

export { keystore, encipher };
