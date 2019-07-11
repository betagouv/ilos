import { RPCErrorType } from '../call/RPCErrorType';

export abstract class RPCException extends Error {
  rpcError: RPCErrorType;
}
