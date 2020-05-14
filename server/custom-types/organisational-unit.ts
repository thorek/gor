import { EntityBuilder } from '../graph-on-rails/builder/entity-builder';

/**
 *
 */
export class OrganisationalUnit extends EntityBuilder {

	name() { return 'OrganisationalUnit' }
	attributes() { return {
      name: { type: "String", validation: {
        "notBlank": true,
        "ofLength": { min: 2, max: 50 }
      }},
      email: { type: "String", validation: {
        "email": true,
        "ofLength": { min: 5 }
      }},
      additionalInfo: { type: "String", validation: {
        "ofLength": { min: 2, max: 100 }
      }}
	}}
	belongsTo() { return [
		{ type: 'Organisation' }
	]}
  seeds() {
    return {
      hr: { name: "HR", additionalInfo: "HR department incl. trainee office", organisation: "disphere" },
      id: { name: "IT", additionalInfo: "excluding our freelance Windows Admin", organisation: "disphere" },
      marketing: { name: "Marketing", organisation: "disphere" }
    };
  }
}
