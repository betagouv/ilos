#!/usr/bin/env node

import { Bootstrap } from './Bootstrap';
console.log('Bootstraping app...');

Bootstrap.boot(process.argv)
  .then(() => {
    console.log('Ready!');
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
