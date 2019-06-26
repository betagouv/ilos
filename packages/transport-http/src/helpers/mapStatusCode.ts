import { Types } from '@ilos/core';

// https://www.jsonrpc.org/historical/json-rpc-over-http.html#response-codes
export function mapStatusCode(call: Types.RPCCallType, results: Types.RPCResponseType): number {
  if (!results) {
    return 204;
  }

  // BATCH requests
  if (Array.isArray(results)) {
    // TODO
    return 200;
  }

  // ONE SHOT requests
  // 500 -32700            Parse error.
  // 400 -32600            Invalid Request.
  // 404 -32601            Method not found.
  // 400 -32602            Invalid params.
  // 500 -32603            Internal error.
  // 500 -32099...-32000   Server error.
  const { error } = results;
  if (error) {
    switch (error.code) {
      case -32600:
      case -32602:
        return 400;
      case -32601:
        return 404;
      default:
        return 500;
    }
  }

  // Notifications return a 204
  if (!('id' in call) || call.id === '' || call.id === null) {
    return 204;
  }

  return 200;
}
