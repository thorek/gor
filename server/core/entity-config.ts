import { EntityReference } from './schema-type';


export type AttributeConfig = { 
  type:string;
}

export type EntityConfig  = {

  name: string;
  typeName?:string;

  attributes?:{[name:string]:string|AttributeConfig};
  belongsTo?:[string|{type:string}];
  hasMany?:string[];

	plural?:string
	singular?:string;

  collection?:string;
  instance?:string;
  label?:string;
  path?:string;
  parent?:string;
}
