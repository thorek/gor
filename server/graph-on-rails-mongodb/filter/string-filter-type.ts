import _ from 'lodash';
import { FilterType } from '../../graph-on-rails/builder/filter-type';
import { GraphQLString, GraphQLBoolean, GraphQLList, GraphQLID } from 'graphql';

/**
 *
 */
export class StringFilterType extends FilterType{

  graphqlType() { return GraphQLString }

  //
  //
  attributes() { return {
		ne: { graphqlType: GraphQLString },
		eq: { graphqlType: GraphQLString },
		in: { graphqlType: new GraphQLList(GraphQLString) },
		notIn: { graphqlType: new GraphQLList(GraphQLString) },
		contains: { graphqlType: GraphQLString },
		notContains: { graphqlType: GraphQLString },
    beginsWith: { graphqlType: GraphQLString },
    caseSensitive: { graphqlType: GraphQLBoolean }
  }}

  //
	//
	getFilterExpression( condition:any, field:string ):any {
		const operator = _.toString( _.first( _.keys( condition ) ) );
		const operand = condition[operator];
		switch( operator ){
			case 'eq': return {'$eq': operand};
			case 'nw': return {'$nw': operand } ;
			case 'contains': return {$regex : new RegExp(`.*${operand}.*`, 'i') };
			case 'notContains':return {$regex : new RegExp(`.*^[${operand}].*`, 'i') };
			case 'beginsWith': return {$regex : new RegExp(`${operand}.*`, 'i') };
		}
		console.warn(`StringFilterType unknown operator '${operator}' `);
	}
}
