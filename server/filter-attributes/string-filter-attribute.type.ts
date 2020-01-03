import _ from 'lodash';
import { FilterAttributeType } from '../core/filter-attribute-type';

/**
 *
 */
export class StringFilterAttributeType extends FilterAttributeType{

	name() { return 'String' }
	attributes() { return {
		ne: { type: 'String' },
		eq: { type: 'String' },
		in: { type: '[String]' },
		notIn: { type: '[String]' },
		contains: { type: 'String' },
		notContains: { type: 'String' },
		beginsWith: { type: 'String' }
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
