const provider = require('./provider');
const contracts = require('./contracts');
const transaction = require('./transaction');
const events = require('./events');

module.exports = {
  ...provider,
  ...contracts,
  ...transaction,
  ...events
};
