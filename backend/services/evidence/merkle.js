const { sha256 } = require('./hash');

function merkleRoot(hashes) {
  if (!hashes.length) return null;
  let level = [...hashes].sort().map((hash) => Buffer.from(hash, 'hex'));
  while (level.length > 1) {
    const next = [];
    for (let index = 0; index < level.length; index += 2) {
      const left = level[index];
      const right = level[index + 1] || left;
      next.push(Buffer.from(sha256(Buffer.concat([left, right])), 'hex'));
    }
    level = next;
  }
  return level[0].toString('hex');
}

module.exports = { merkleRoot };