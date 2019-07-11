import { RPCErrorType } from '@ilos/common';

export abstract class RPCException extends Error {
  rpcError: RPCErrorType;
}
