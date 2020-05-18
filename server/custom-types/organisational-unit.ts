import { EntityBuilder } from '../graph-on-rails/builder/entity-builder';

/**
 *
 */
export class OrganisationalUnit extends EntityBuilder {

	name() { return 'OrganisationalUnit' }
	attributes() { return {
      name: { type: "String", validation: {
        "presence": true,
        "length": { minimum: 2, maximum: 50 }
      }},
      email: { type: "String", validation: {
        "email": true
      }},
      additionalInfo: { type: "String", validation: {
        "length": { minimum: 10, maximum: 100 }
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

  permissions() {
    return {
      user: {
        read: "user.client.id $eq organisationalUnit.id"
      },
      dsbo: {
        extend: 'user',
        ['create,update'] : "(user.client.id $eq organisationalUnit.clientId) $and (organisationalUnit.clientId $neq '00001')"
      },
      admin: true
    };
  }
}
