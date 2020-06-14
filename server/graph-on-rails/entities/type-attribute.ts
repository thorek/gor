import { GraphQLType } from 'graphql';

//
export type TypeAttribute = {
  graphqlType:GraphQLType|string
  filterType?:GraphQLType|string|false
  validation?:any
  unique?:string|boolean;
  required?:boolean|'create'|'update'
  description?:string
  virtual?:boolean
}

