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
  seeds() {
    return [
      {street: "Lindenstraße", zip: "12345", city: "Berlin", country: "Germany" },
      {street: "Meisenweg", zip: "98765", city: "München", country: "Germany" }
    ];
  }
}
