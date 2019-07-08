import { NewableType } from './NewableType';
import { AbstractType } from './AbstractType';

export type IdentifierType<T = any> = (string | symbol | NewableType<T> | AbstractType<T>);