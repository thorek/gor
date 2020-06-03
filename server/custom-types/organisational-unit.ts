import { Entity } from '../graph-on-rails/entities/entity';

/**
 *
 */
export class OrganisationalUnit extends Entity {

	getName() { return 'OrganisationalUnit' }
	getAttributes() { return {
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
	getBelongsTo() { return [
		{ type: 'Organisation' }
	]}
  getSeeds() {
    return {
      hr: { name: "HR", additionalInfo: "HR department incl. trainee office", Organisation: "disphere" },
      it: { name: "IT", additionalInfo: "excluding our freelance Windows Admin", Organisation: "disphere" },
      marketing: { name: "Marketing", Organisation: "disphere" },
      sales: { name: "Sales", Organisation: "disphere" },
      hrfs: { name: "HR", additionalInfo: "HR department incl. trainee office", Organisation: "funstuff" },
      itfs: { name: "IT", additionalInfo: "excluding our freelance Windows Admin", Organisation: "funstuff" },
      marketingfs: { name: "Marketing", Organisation: "funstuff" },
      gfBoring: { name: "GF", Organisation: "boring" },
      productionBoring: { name: "Produktion", Organisation: "boring" },
    };
  }
  getPermissions() {
    return {
      admin: true,
      user: {
        all: "Organisation.read"
      }
    }
  }

}
