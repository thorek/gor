import inflection from 'inflection';
import _ from 'lodash';

import { Context } from '../core/context';
import { CrudAction, EntityPermissions } from './entity-permissions';
import { EntitySeeder } from './entity-seeder';
import { EntityValidator, ValidationViolation } from './entity-validator';
import { TypeAttribute } from './type-attribute';
import { ResolverContext } from '../core/resolver-context';
import { EntityResolveHandler } from './entity-resolve-handler';
import { EntityAccessor } from './entity-accessor';

//
//
export type EntityReference = {
	type:string
  required?:boolean
  input?:boolean
}

//
//
export abstract class Entity {

  private _context!:Context;
  get context() { return this._context }
  get graphx() { return this.context.graphx }
  get resolver() { return this.context.resolver }
  get entitySeeder() { return this._entitySeeder }
  get entityPermissions() { return this._entityPermissions }
  get entityResolveHandler() { return this._entityResolveHandler }
  get entityValidator() { return this._entityValidator }
  get entityAccessor() { return this._entityAccessor }

  protected _entitySeeder!:EntitySeeder;
  protected _entityResolveHandler!:EntityResolveHandler;
  protected _entityPermissions!:EntityPermissions;
  protected _entityValidator!:EntityValidator;
  protected _entityAccessor!:EntityAccessor;

  /**
   *
   */
  init( context:Context ){
    this._context = context;
    this.context.entities[this.typeName] = this;
    this._entityResolveHandler = this.context.entityResolveHandler( this );
    this._entitySeeder = this.context.entitySeeder( this );
    this._entityPermissions = this.context.entityPermissions( this );
    this._entityValidator = new EntityValidator( this );
    this._entityAccessor = new EntityAccessor( this );
  }

  get name() { return this.getName() }
  get typeName(){ return this.getTypeName() }
  get attributes() { return this.getAttributes() }
  get assocTo() { return this.getAssocTo() }
  get assocToInput() { return _.filter( this.getAssocTo(), assocTo => assocTo.input === true ) }
  get assocToMany() { return this.getAssocToMany() }
  get assocFrom() { return this.getAssocFrom() }
  get singular() { return this.getSingular() }
  get plural() { return this.getPlural() }
  get foreignKey() { return this.getForeignKey() }
  get foreignKeys() { return this.getForeignKeys() }
  get createInputTypeName() { return this.getCreateInputTypeName() }
  get updateInputTypeName() { return this.getUpdateInputTypeName() }
  get filterName() { return this.getFilterName() }
  get collection() { return this.getCollection() }
  get label() { return this.getLabel() }
  get path() { return this.getPath() }
  get parent() { return this.getParent() }
  get enum() { return this.getEnum() }
  get seeds() { return this.getSeeds() }
  get permissions() { return this.getPermissions() }
  get equality() { return this.getEquality() }
  get description() { return this.getDescription() }
  get entities() { return this.getEntites() }
  get typeField() { return this.getTypeField() }
  get typesEnumName() { return this.getTypeEnumName() }
  get isInterface():boolean { return this.getIsInterface() }
  get isUnion():boolean { return  ! this.isInterface && ! _.isEmpty( this.entities ) }
  get isPolymorph():boolean { return this.isUnion || this.isInterface }
  get implements():Entity[] { return _.filter( this.getImplements(), entity => entity.isInterface ) }
  get createMutationName():string { return this.getCreateMutationName() }
  get updateMutationName():string { return this.getUpdateMutationName() }
  get mutationResultName():string { return this.getMutationResultName() }

  protected abstract getName():string;
	protected getTypeName() { return inflection.camelize( this.name ) }
	protected getSingular() { return `${_.toLower(this.typeName.substring(0,1))}${this.typeName.substring(1)}` }
  protected getPlural() { return inflection.pluralize( this.singular ) }
  protected getForeignKey() { return `${this.singular}Id` }
  protected getForeignKeys() { return `${this.singular}Ids` }
  protected getCreateInputTypeName() { return `${this.typeName}CreateInput` }
  protected getUpdateInputTypeName() { return `${this.typeName}UpdateInput` }
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
  protected getDescription():string|undefined { return }
  protected getEntites():Entity[] { return [] }
  protected getIsInterface():boolean { return false }
  protected getImplements():Entity[] { return [] }
  protected getTypeField():string { return `${this.singular}Type` }
  protected getTypeEnumName():string { return `${this.typeName}Types` }
  protected getCreateMutationName():string { return `create${this.typeName}` }
  protected getUpdateMutationName():string { return `update${this.typeName}` }
  protected getMutationResultName():string { return `Save${this.typeName}MutationResult` }


  /**
   *
   */
  getAttribute(name:string):TypeAttribute {
    return this.attributes[name];
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
  async getPermittedIds( action:CrudAction, resolverCtx:ResolverContext ):Promise<boolean|number[]> {
    if( ! this.entityPermissions ) throw new Error("no EntityPermission provider" );
    return this.entityPermissions.getPermittedIds( action, resolverCtx );
  }

  /**
   *
   */
  async validate( resolverCtx:ResolverContext ):Promise<ValidationViolation[]> {
    return await this.entityValidator.validate( resolverCtx );
  }

  /**
   * @returns true if the given entity is an interface and this entity implements it
   */
  implementsEntityInterface( entity:Entity):boolean {
    if( ! entity.isInterface ) return false;
    return _.includes( this.implements, entity );
  }

  /**
   *
   */
  async findById( id:any, decorate = true ):Promise<any> {
    return this.entityAccessor.findById( id, decorate );
  }

  /**
   *
   */
  async findByIds( ids:any[], decorate = true ):Promise<any[]> {
    return this.entityAccessor.findByIds( ids, decorate );
  }

  /**
   *
   */
  async findByAttribute( attrValue:{[name:string]:any}, decorate = true ):Promise<any> {
    return this.entityAccessor.findByAttribute( attrValue, decorate );
  }

  /**
   *
   */
  async findOneByAttribute( attrValue:{[name:string]:any}, decorate = true ):Promise<any> {
    return _.first( await this.entityAccessor.findByAttribute( attrValue, decorate ) );
  }

}
