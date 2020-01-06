import { EntityType } from 'graph-on-rails';

//
//
export class PersonType extends EntityType {

	name() { return 'Person' }
	attributes() { return {
		firstname: { type: "String" },
		lastname: { type: "String" },
		birthdate: { type: "String" },
		gender: { type: 'Gender' },
		age: { type: 'Int' }
	}}
	hasMany() { return [
    { type: 'Address' },
    { type: 'Car' }
	]}
	enums() { return {
		Gender: {
			MALE: 'male',
			FEMALE: 'female',
			DIVERSE: 'diverse'
		}
	}}

}
