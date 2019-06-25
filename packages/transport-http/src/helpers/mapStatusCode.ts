// https://www.jsonrpc.org/historical/json-rpc-over-http.html#response-codes
export function mapStatus(call, results): { message: string; code: number; data?: string } {
  // BATCH requests
  if (Array.isArray(results)) {
    // TODO
    return {
      code: 200,
      message: 'OK',
    };
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
        return {
          code: 400,
          message: 'Bad Request',
          data: error.data,
        };
      case -32601:
        return {
          code: 404,
          message: 'Method not found',
          data: error.data,
        };
      default:
        return {
          code: 500,
          message: 'Server error',
          data: error.data,
        };
    }
  }

  // Notifications return a 204
  if (!('id' in call) || call.id === '' || call.id === null) {
    return {
      code: 204,
      message: 'No Content',
    };
  }

  return {
    code: 200,
    message: 'OK',
  };
}
