import { EntityType } from '../core/entity-type';

/**
 *
 */
export class AddressType extends EntityType {

	name() { return 'Address' }
	attributes() { return {
			street: { type: "String" },
			zip: { type: "String" },
			city: { type: "String" },
			country: { type: "String" }
	}}
	belongsTo() { return [
		{ type: 'Person' }
	]}
  parent() { return "foo" }
}
