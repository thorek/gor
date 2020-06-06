import inflection from 'inflection';
import _ from 'lodash';

import { Attribute } from '../builder/attribute';
import { GorContext } from '../core/gor-context';
import { Validator } from '../validation/validator';
import { CrudAction, EntityPermissions } from './entity-permissions';
import { EntitySeeder } from './entity-seeder';
import { EntityValidator } from './entity-validator';

//
//
export type EntityReference = {
	type:string;
  required?:boolean;
}

//
//
export type TypeAttribute = {
  type:string;
	filterType?:string;
  validation?:any; // todo validation type
  unique?:string|boolean
}

//
//
export abstract class Entity {

  private _context!:GorContext;
  get context() { return this._context }
  get graphx() {return this.context.graphx };
  get resolver() {return this.context.resolver };

  public entitySeeder!:EntitySeeder;
  public entityPermissions!:EntityPermissions;
  protected entityValidator!:EntityValidator;

  /**
   *
   */
  init( context:GorContext ){
    this._context = context;

    // this.addLockRelations();

    this.context.entities[this.typeName] = this;
    this.entitySeeder = this.context.entitySeeder( this );
    this.entityPermissions = this.context.entityPermissions( this );
    this.entitySeeder = this.context.entitySeeder( this );
    this.entityValidator = new EntityValidator( this )
  }

  get name() { return this.getName() }
  get typeName(){ return this.getTypeName() }
  get attributes() { return this.getAttributes() }
  get assocTo() { return this.getAssocTo() }
  get assocToMany() { return this.getAssocToMany() }
  get assocFrom() { return this.getAssocFrom() }
  get singular() { return this.getSingular() }
  get plural() { return this.getPlural() }
  get foreignKey() { return this.getForeignKey() }
  get foreignKeys() { return this.getForeignKeys() }
  get inputName() { return this.getInputName() }
  get filterName() { return this.getFilterName() }
  get collection() { return this.getCollection() }
  get label() { return this.getLabel() }
  get path() { return this.getPath() }
  get parent() { return this.getParent() }
  get enum() { return this.getEnum() }
  get seeds() { return this.getSeeds() }
  get permissions() { return this.getPermissions() }
  get equality() { return this.getEquality() }

  protected abstract getName():string;
	protected getTypeName() { return inflection.camelize( this.name ) }
	protected getSingular() { return `${_.toLower(this.typeName.substring(0,1))}${this.typeName.substring(1)}` }
  protected getPlural() { return inflection.pluralize( this.singular ) }
  protected getForeignKey() { return `${this.singular}Id` }
  protected getForeignKeys() { return `${this.singular}Ids` }
  protected getInputName() { return `${this.typeName}Input` }
  protected getFilterName() { return `${this.typeName}Filter` }
  protected getCollection() { return this.plural }
  protected getLabel() { return inflection.titleize(  this.plural )  }
  protected getPath() { return this.plural }
	protected getAttributes():{[name:string]:TypeAttribute} { return {} };
  protected getAssocTo(): EntityReference[] { return [] }
  protected getAssocToMany(): EntityReference[] { return [] }
	protected getAssocFrom(): EntityReference[] { return [] }
  protected getParent():string | null { return null }
  protected getEnum():{[name:string]:{[key:string]:string}} { return {} }
  protected getSeeds():{[name:string]:any} { return {} }
  protected getPermissions():null|{[role:string]:boolean|string|{[action:string]:string|object|(string|object)[]}} { return null }
  protected getEquality():{[typeName:string]:string[]} {return {}}

  public getAttribute( name:string): Attribute {
    const attr = this.attributes[name];
    const type = attr ? attr.type : undefined;
    return new Attribute( name, type, this.graphx );
  }

  /**
   *
   */
  isAssocToAttribute( attribute:string ):boolean {
    return _.find( this.assocTo, assocTo => {
      const ref = this.context.entities[assocTo.type];
      return ref && ref.foreignKey === attribute;
    }) != null;
  }

  /**
   *
   */
  isAssocToMany( ref:Entity ):boolean {
    return _.find( this.assocToMany, assocToMany => assocToMany.type === ref.typeName ) != undefined;
  }


  /**
   *
   */
  async getPermittedIds( action:CrudAction, context:any ):Promise<boolean|number[]> {
    if( ! this.entityPermissions ) throw new Error("no EntityPermission provider" );
    return this.entityPermissions.getPermittedIds( action, context );
  }

  /**
   *
   */
  async validate( root: any, args: any, context:any ):Promise<string[]> {
    return await this.entityValidator.validate( root, args, context );
  }

}
