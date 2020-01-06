import _ from 'lodash';
import { FilterAttributeType } from '../core/filter-attribute-type';
import { GraphQLInputObjectType, GraphQLList, GraphQLEnumType } from 'graphql';

//
//
export class EnumFilterAttributeType extends FilterAttributeType {

	name(): string { return this._name; }

	//
	//
	constructor( private _name:string ){ super() }

	//
	//
	createObjectType():void {
		const filterName = `${this._name}Filter`;
		this.graphx.type( filterName, {
			name: filterName,
			from: GraphQLInputObjectType,
			fields: () => {
				const enumType = this.graphx.type( this._name );
				return {
					ne: { type: enumType},
					eq: { type: enumType },
					in: { type: new GraphQLList( enumType ) },
					notIn: { type: new GraphQLList( enumType ) }
				}
			}
		});
	}

	//
	//
	getFilterExpression( condition:any, field:string ):any {
		const enumType = this.graphx.type( this._name );
		if( ! ( enumType instanceof GraphQLEnumType ) ) return null;
		const operator = _.toString( _.first( _.keys( condition ) ) );
		const operand = condition[operator];
		switch( operator ){
			case 'eq': return {'$eq': operand};
			case 'nw': return {'$nw': operand } ;
			case 'contains': return {$regex : new RegExp(`.*${operand}.*`, 'i') };
			case 'notContains':return {$regex : new RegExp(`.*^[${operand}].*`, 'i') };
			case 'beginsWith': return {$regex : new RegExp(`${operand}.*`, 'i') };
		}
		console.warn(`EnumFilterType '${this._name}' unknown operator '${operator}' `);
	}


}
