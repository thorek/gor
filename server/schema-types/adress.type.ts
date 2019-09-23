import { EntityType } from '../core/entity-type';

/**
 * 
 */
export class AddressType extends EntityType{

	get name() { return 'Address' }
	get attributes() { return {
			street: { type: "String" },
			zip: { type: "String" },
			city: { type: "String" },
			country: { type: "String" }
	}}
	get belongsTo() { return [
		{ type: 'Person' }
	]}

}