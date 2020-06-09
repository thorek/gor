import _ from 'lodash';
import { FilterType } from '../../graph-on-rails/builder/filter-type';
import { GraphQLInt, GraphQLList } from 'graphql';

/**
 *
 */
export class IntFilterType extends FilterType{

  graphqlType() { return GraphQLInt }

	attributes() { return {
		eq: { graphqlType: GraphQLInt },
		ne: { graphqlType: GraphQLInt },
		le: { graphqlType: GraphQLInt },
		lt: { graphqlType: GraphQLInt },
		ge: { graphqlType: GraphQLInt },
		gt: { graphqlType: GraphQLInt },
		isIn: { graphqlType: new GraphQLList(GraphQLInt) },
		notIn: { graphqlType: new GraphQLList(GraphQLInt) },
		between: { graphqlType: new GraphQLList(GraphQLInt) },
	}}

	//
	//
	getFilterExpression( condition:any, field:string ):any {
		const operator = _.toString( _.first( _.keys( condition ) ) );
		const operand = condition[operator];
		switch( operator ){
		// 	case 'eq': return { $eq : operand };
		// 	case 'ne': return { $ne : operand };
		// 	case 'contains': return { $regex : new RegExp(`.*${operand}.*`, 'i') };
		// 	case 'notContains': return { $regex : new RegExp(`.*^[${operand}].*`, 'i')  };
		// 	case 'beginsWith': return { $regex : new RegExp(`${operand}.*`, 'i')  };
		// }

		}
	}
}
