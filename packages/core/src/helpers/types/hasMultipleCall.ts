import { RPCCallType, RPCSingleCallType } from '@ilos/common';

export function hasMultipleCall(c: RPCCallType): c is RPCSingleCallType[] {
  return (<RPCCallType[]>c).forEach !== undefined;
}
