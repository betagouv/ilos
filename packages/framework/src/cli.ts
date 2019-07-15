#!/usr/bin/env node

import { Bootstrap } from './Bootstrap';
console.log('Bootstraping app...');

Bootstrap
  .createFromPath()
  .then((app) => {
    const [_1, _2, command, ...opts] = process.argv;
    app
    .boot(command, ...opts)
    .then(() => {
      console.log('Ready!');
    })
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
  });
