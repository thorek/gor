import { EntityBuilder } from '../graph-on-rails/builder/entity-builder';


/**
 *
 */
export class AddressType extends EntityBuilder {

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
