import { RPCException } from '@ilos/common';

export function isAnRPCException(error: Error): error is RPCException {
  return (<RPCException>error).rpcError !== undefined;
}
