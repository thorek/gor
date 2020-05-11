import _ from 'lodash';
import { FilterTypeBuilder } from '../../../graph-on-rails/src/builder/filter-type-builder';

/**
 *
 */
export class StringFilterTypeBuilder extends FilterTypeBuilder{

	name() { return 'String' }
	attributes() { return {
		ne: { type: 'String' },
		eq: { type: 'String' },
		in: { type: '[String]' },
		notIn: { type: '[String]' },
		contains: { type: 'String' },
		notContains: { type: 'String' },
    beginsWith: { type: 'String' },
    caseSensitive: { type: 'Boolean' }
	}}

  //
  // TODO must come from resolver
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
