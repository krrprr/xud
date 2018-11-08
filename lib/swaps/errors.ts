import errorCodesPrefix from '../constants/errorCodesPrefix';

const codesPrefix = errorCodesPrefix.SWAPS;

const errorCodes = {
  CLIENT_NOT_FOUND: codesPrefix.concat('.1'),
};

const errors = {
  CLIENT_NOT_FOUND: (currency: string) => ({
    message: `unable to get client for currency ${currency}`,
    code: errorCodes.CLIENT_NOT_FOUND,
  }),
};

export { errorCodes };
export default errors;
