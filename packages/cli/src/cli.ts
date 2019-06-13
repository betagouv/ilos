#!/usr/bin/env node

import { bootstrap } from './Bootstrap';
console.log('Bootstraping app...');

bootstrap.boot(process.argv)
  .then(() => {
    console.log('Ready!');
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
