import { strict as assert } from 'assert';
import { EnvNotFoundException } from '../exceptions';

declare type SBN = string | boolean | number;

export function cast(str: string): SBN {
  assert(typeof str === 'string');

  // boolean
  if (['true', 'false'].indexOf(str.toLowerCase().trim()) > -1) {
    return str.toLowerCase().trim() === 'true';
  }

  // number
  const num = parseFloat(str);

  // string if not a number
  return isNaN(num) ? str : num;
}

export function env(k: string, fallback?: SBN): SBN {
  const val: SBN = k in process.env ? cast(process.env[k]) : fallback;

  if (val === null || typeof val === 'undefined') {
    throw new EnvNotFoundException(`Env key '${k}' not found`);
  }

  return val;
}
