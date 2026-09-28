const fs = require('node:fs/promises');
const path = require('node:path');

function storageDirectory() {
  return path.resolve(__dirname, '..', '..', process.env.EVIDENCE_STORAGE_DIR || 'storage/evidence');
}

async function storeArtifact(evidenceId, content) {
  const directory = storageDirectory();
  await fs.mkdir(directory, { recursive: true });
  const location = path.join(directory, `${evidenceId}.bin`);
  await fs.writeFile(location, content, { flag: 'wx' });
  return location;
}

async function readArtifact(location) {
  return fs.readFile(location);
}

async function overwriteArtifact(location, content) {
  const directory = storageDirectory();
  if (path.dirname(path.resolve(location)) !== directory) {
    throw Object.assign(new Error('Evidence artifact is outside the configured storage directory'), { status: 400 });
  }
  await fs.writeFile(location, content);
}

module.exports = { storeArtifact, readArtifact, overwriteArtifact };