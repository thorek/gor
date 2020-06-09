
import _ from 'lodash';
import { GraphQLType, GraphQLID, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLNonNull } from "graphql";
import { GorContext } from "graph-on-rails/core/gor-context";


//
export type TypeAttribute = {
  graphqlType:GraphQLType|string;
  filterType?:GraphQLType|string;
  validation?:any;
  unique?:string|boolean;
  required?:boolean;
}

