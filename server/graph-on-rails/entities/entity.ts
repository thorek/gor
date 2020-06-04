import _ from 'lodash';
import inflection from 'inflection';
import { GorContext } from '../core/gor-context';
import { Attribute } from '../builder/attribute';
import { GraphX } from '../core/graphx';
import { CrudAction, EntityPermissions } from './entity-permissions';
import { Validator } from '../validation/validator';
import { Resolver } from '../core/resolver';
import { EntitySeeder } from './entity-seeder';

//
//
export type EntityReference = {
	type:string;
}

//
//
export type TypeAttribute = {
  type:string;
	filterType?:string;
  validation?:any; // todo validation type
}

//
//
export abstract class Entity {

  /**
   *
   */
  constructor( public readonly gorContext:GorContext ){}

  public graphx!:GraphX;
  public resolver!:Resolver;
  public entitySeeder!:EntitySeeder;
  public entityPermissions!:EntityPermissions;
  protected validator!:Validator;

  /**
   *
   */
  init( graphx:GraphX ){
    this.graphx = graphx;

    // this.addLockRelations();

    this.graphx.entities[this.typeName] = this;
    this.entitySeeder = this.gorContext.entitySeeder( this );
    this.resolver = this.gorContext.resolver( this );
    this.validator = this.gorContext.validator( this );
    this.entityPermissions = this.gorContext.entityPermissions( this );
    this.entitySeeder = this.gorContext.entitySeeder( this );
  }

  get name() { return this.getName() }
  get typeName(){ return this.getTypeName() }
  get attributes() { return this.getAttributes() }
  get belongsTo() { return this.getBelongsTo() }
  get belongsToMany() { return this.getBelongsToMany() }
  get hasMany() { return this.getHasMany() }
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
  protected getBelongsTo(): EntityReference[] { return [] }
  protected getBelongsToMany(): EntityReference[] { return [] }
	protected getHasMany(): EntityReference[] { return [] }
  protected getParent():string | null { return null }
  protected getEnum():{[name:string]:{[key:string]:string}} { return {} }
  protected getSeeds():{[name:string]:any} { return {} }
  protected getPermissions():null|{[role:string]:boolean|string|{[action:string]:string|object|(string|object)[]}} { return null }
  protected getEquality():{[typeName:string]:string[]} {return {}}

  public getAttribute( name:string): Attribute {
    return new Attribute( name, this.attributes[name], this.graphx );
  }

  /**
   *
   */
  isBelongsToAttribute( attribute:string ):boolean {
    return _.find( this.belongsTo, bt => {
      const ref = this.graphx.entities[bt.type];
      return ref && ref.foreignKey === attribute;
    }) != null;
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
    const errors:string[] = []; //await this.validateRelations( root, args, context );
    if( ! this.validator ) return errors;
    return _.concat( errors, await this.validator.validate( root, args ) );
  }


}
