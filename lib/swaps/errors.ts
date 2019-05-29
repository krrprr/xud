import errorCodesPrefix from '../constants/errorCodesPrefix';

const codesPrefix = errorCodesPrefix.SWAPS;
const errorCodes = {
  SWAP_CLIENT_NOT_FOUND: codesPrefix.concat('.1'),
  SWAP_CLIENT_NOT_CONFIGURED: codesPrefix.concat('.2'),
  SWAP_CLIENT_RAIDEN_DISABLED: codesPrefix.concat('.3'),
};

const errors = {
  SWAP_CLIENT_NOT_FOUND: (currency: string) => ({
    message: `swapClient for currency ${currency} not found`,
    code: errorCodes.SWAP_CLIENT_NOT_FOUND,
  }),
  SWAP_CLIENT_NOT_CONFIGURED: (currency: string) => ({
    message: `swapClient for currency ${currency} is not configured`,
    code: errorCodes.SWAP_CLIENT_NOT_CONFIGURED,
  }),
  SWAP_CLIENT_RAIDEN_DISABLED: (currency: string) => ({
    message: `raiden is disabled ${currency} orders cannot be placed`,
    code: errorCodes.SWAP_CLIENT_RAIDEN_DISABLED,
  }),
};

export { errorCodes, errors };
