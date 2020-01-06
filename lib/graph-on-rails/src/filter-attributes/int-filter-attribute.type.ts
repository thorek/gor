import _ from 'lodash';
import { FilterAttributeType } from '../core/filter-attribute-type';

/**
 *
 */
export class IntFilterAttributeType extends FilterAttributeType{

	name() { return 'Int' }
	attributes() { return {
		eq: { type: 'int' },
		ne: { type: 'int' },
		le: { type: 'int' },
		lt: { type: 'int' },
		ge: { type: 'int' },
		gt: { type: 'int' },
		isIn: { type: '[int]' },
		notIn: { type: '[int]' },
		between: { type: '[int]' },
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
