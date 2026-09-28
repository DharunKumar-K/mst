const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

function routePrefix(filename) {
  const name = filename.replace(/\.routes\.js$/, '').replace(/\.([a-z])/g, (_match, letter) => letter.toUpperCase());
  return name === 'batch' ? 'batches' : name;
}

function loadRoutes(directory = __dirname) {
  const router = express.Router();
  const files = fs.readdirSync(directory)
    .filter((file) => file.endsWith('.routes.js'))
    .sort();

  for (const file of files) {
    const routeModule = require(path.join(directory, file));
    const route = routeModule.router || routeModule;
    router.use(`/${routePrefix(file)}`, route);
  }

  return router;
}

module.exports = loadRoutes;
module.exports.routePrefix = routePrefix;