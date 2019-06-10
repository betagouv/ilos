import { ParamsType, ResultType, ContextType } from '../types';

export interface MiddlewareInterface {
  process(params: ParamsType, context: ContextType, next?: Function, options?: any):Promise<ResultType>;
}

export type FunctionMiddlewareInterface = (params: ParamsType, context: ContextType, next?: Function) => Promise<ResultType>;
