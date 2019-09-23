import { EntityType } from '../core/entity-type';

//
//
export class PersonType extends EntityType {
	
	get name() { return 'Person' }
	get attributes() { return {
		firstname: { type: "String" },
		lastname: { type: "String" },
		birthdate: { type: "String" },
		gender: { type: 'Gender' },
		age: { type: 'Int' }
	}}
	get hasMany() { return [
		{ type: 'Address' }
	]}
	get enums() { return {
		Gender: {
			MALE: 0,
			FEMALE: 1,
			DIVERSE: 2
		}
	}}


}