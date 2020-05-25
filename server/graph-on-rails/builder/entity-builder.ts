import { AuthenticationError } from 'apollo-server-express';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import inflection from 'inflection';
import _ from 'lodash';

import { GorConfig } from '../core/gor';
import { GraphX } from '../core/graphx';
import { Validator } from '../validation/validator';
import { EntityReference, SchemaBuilder } from './schema-builder';

export type CrudAction = "read" | "create" | "update" | "delete";

/**
 * Base class for all Entities
 */
export abstract class EntityBuilder extends SchemaBuilder {

	belongsTo(): EntityReference[] { return [] }
	hasMany(): EntityReference[] { return [] }
	singular() { return `${_.toLower(this.typeName().substring(0,1))}${this.typeName().substring(1)}` }
	plural() { return inflection.pluralize( this.singular() ) }

  collection() { return this.plural() }
  instance() { return this.singular() }
  label() { return inflection.titleize(  this.plural() )  }
  path() { return this.plural() }
  parent():string | null { return null }

  enum():{[name:string]:{[key:string]:string}} { return {} }
  seeds():{[name:string]:any} { return {} }
  permissions():null|{[role:string]:{[action:string]:boolean|string|string[]}} { return null }

  get resolver() { return this.gorConfig.resolver }
  get validatorFactory() { return this.gorConfig.validatorFactory }

  protected validator?:Validator;

	//
	//
	constructor( protected readonly gorConfig:GorConfig){
    super();
  }

	//
	//
	init( graphx:GraphX ):void {
    super.init( graphx );
    this.resolver.init( this );
    this.graphx.entities[this.name()] = this;
    this.validator = this.validatorFactory.createValidator( this );
	}


	//
	//
	protected createEnums():void {
		_.forEach( this.enum(), (keyValues:any, name:string) => {
			const values = {};
			_.forEach( keyValues, (value,key) => _.set( values, key, { value }));
			this.graphx.type( name, { name, values, from: GraphQLEnumType	} );
			this.resolver.addEnumFilterAttributeType( name, this.graphx );
		});
	}


	//
	//
	protected createObjectType():void {
    this.createEnums();
		const name = this.typeName();
		this.graphx.type( name, { name, fields: () => {
			const fields = {  id: { type: GraphQLID } };
			return this.setAttributes( fields );
		} });
	}

	//
	//
	extendTypes():void {
		this.createInputType();
		this.createFilterType();
		this.addReferences();
		this.addQueries();
    this.addMutations();
    this.resolver.extendType( this );
	}

	//
	//
	addReferences():void {
		this.addBelongsTo();
		this.addHasMany();
	}

	//
	//
	addMutations():void {
		this.addSaveMutation();
		this.addDeleteMutation();
	}

	//
	//
	addQueries():void  {
		this.addTypeQuery();
    this.addTypesQuery();
  }


	//
	//
	protected addBelongsTo():void {
    const belongsTo = _.filter( this.belongsTo(), bt => this.checkReference( 'belongsTo', bt ) );
		this.graphx.type(this.typeName()).extend(
      () => _.reduce( belongsTo, (fields, ref) => this.addBelongsToReference( fields, ref ), {} ));
    this.graphx.type(`${this.typeName()}Input`).extend(
      () => _.reduce( belongsTo, (fields, ref) => this.addBelongsToId( fields, ref ), {} ));
	}

  //
  //
  private addBelongsToId( fields:any, ref:EntityReference ):any {
    const refEntity = this.graphx.entities[ref.type];
    return _.set( fields, `${refEntity.singular()}Id`, { type: GraphQLID });
  }

  //
  //
  private addBelongsToReference( fields:any, ref:EntityReference ):any {
    const refEntity = this.graphx.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName());
    return _.set( fields, refEntity.singular(), {
      type: refObjectType,
      resolve: (root:any, args:any, context:any ) => this.resolver.resolveRefType( refEntity, root, args, context )
    });
  }


	//
	//
	protected addHasMany():void {
    const hasMany = _.filter( this.hasMany(), hm => this.checkReference( 'hasMany', hm ) );
		this.graphx.type(this.typeName()).extend(
      () => _.reduce( hasMany, (fields, ref) => this.addHasManyReference( fields, ref ), {} ));
  }

  //
  //
  private addHasManyReference(fields:any, ref:EntityReference):any {
    const refEntity = this.graphx.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName())
    return _.set( fields, refEntity.plural(), {
      type: new GraphQLList( refObjectType ),
      resolve: (root:any, args:any, context:any ) => this.resolver.resolveRefTypes( this, refEntity, root, args, context )
    });
  }

  //
  //
  private checkReference( direction:'belongsTo'|'hasMany', ref:EntityReference ):boolean {
    const refEntity = this.graphx.entities[ref.type];
    if( ! (refEntity instanceof EntityBuilder) ) {
      console.warn( `'${this.typeName()}:${direction}': no such entity type '${ref.type}'` );
      return false;
    }
    if( ! this.graphx.type(refEntity.typeName()) ) {
      console.warn( `'${this.typeName()}:${direction}': no objectType in '${ref.type}'` );
      return false;
    }
    return true;
  }


	//
	//
	protected createInputType():void {
		const name = `${this.typeName()}Input`;
		this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
			const fields = { id: { type: GraphQLID }};
			return this.setAttributes( fields );
		}});
	}

	//
	//
	protected setAttributes( fields:any ):any {
		_.forEach( this.getAttributes(), (attribute,name) => {
			_.set( fields, name, { type: attribute.getType()} );
    });
    return fields;
	}


	//
	//
	protected createFilterType():void {
		const name = `${this.typeName()}Filter`;
		this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
			const fields = { id: { type: GraphQLID } };
			_.forEach( this.getAttributes(), (attribute, name) => {
				_.set( fields, name, { type: attribute.getFilterInputType() } );
			});
			return fields;
		} });
	}

	//
	//
	protected addTypeQuery(){
		this.graphx.type( 'query' ).extend( () => {
			return _.set( {}, this.singular(), {
				type: this.graphx.type(this.typeName()),
				args: { id: { type: GraphQLID } },
				resolve: (root:any, args:any, context:any) => this.resolver.resolveType( this, root, args, context )
			});
    });
	}

	//
	//
	protected addTypesQuery(){
		this.graphx.type( 'query' ).extend( () => {
			return _.set( {}, this.plural(), {
				type: new GraphQLList( this.graphx.type(this.typeName()) ),
				args: { filter: { type: this.graphx.type(`${this.typeName()}Filter`) } },
        resolve: (root:any, args:any, context:any) => this.resolver.resolveTypes( this, root, args, context )
			});
		});
	}

	//
	//
	protected addSaveMutation():void {
		this.graphx.type( 'mutation' ).extend( () => {
      const typeName = this.typeName();
      const singular = this.singular();
      const args = _.set( {}, this.singular(), { type: this.graphx.type(`${typeName}Input`)} );
      let fields = { errors: {type: new GraphQLNonNull(new GraphQLList(GraphQLString)) } };
      fields = _.set( fields, singular, {type: this.graphx.type(typeName) } );
      const type = new GraphQLObjectType( { name: `Save${typeName}MutationResult`, fields } );
      return _.set( {}, `save${typeName}`, {
				type,	args, resolve: (root:any, args:any, context:any ) => this.saveEntity( root, args, context )
			});
		});
	}

  /**
   *
   */
  private async saveEntity( root: any, args: any, context:any ) {
    const errors = await this.validate( root, args );
    if( _.size( errors ) ) return { errors };
    return _.set( {errors: []}, this.singular(), this.resolver.saveEntity( this, root, args, context ) );
  }

  /**
   *
   */
  protected async validate( root: any, args: any ):Promise<string[]> {
    if( ! this.validator ) return [];
    return await this.validator.validate( root, args );
  }

	//
	//
	protected addDeleteMutation():void {
		this.graphx.type( 'mutation' ).extend( () => {
			return _.set( {}, `delete${this.typeName()}`, {
				type: GraphQLBoolean,
				args: { id: { type: GraphQLID } },
				resolve: (root:any, args:any, context:any ) => this.resolver.deleteEntity( this, root, args, context )
			});
		});
  }

  /**
   *
   */
  public async truncate():Promise<boolean> {
    return await this.resolver.dropCollection( this );
  }

  /**
   *
   */
  public async seedAttributes( context:any ):Promise<any> {
    const ids = {};
    await Promise.all( _.map( this.seeds(), (seed, name) => this.seedInstanceAttributes( name, seed, ids, context ) ) );
    return _.set( {}, this.singular(), ids );
  }

  /**
   *
   */
  private async seedInstanceAttributes( name:string, seed:any, ids:any, context:any ):Promise<any> {
    try {
      const args = _.set( {}, this.singular(), _.pick( seed, _.keys( this.attributes() ) ) );
      const entity = await this.resolver.saveEntity( this, {}, args, context );
      _.set( ids, name, entity.id );
    } catch (error) {
      console.error( `Entity '${this.name() }' could not seed an instance`, seed, error );
    }
  }

  /**
   *
   */
  public async seedReferences( idsMap:any, context:any ):Promise<void> {
    await Promise.all( _.map( this.seeds(), async (seed, name) => {
      await Promise.all( _.map( this.belongsTo(), async belongsTo => {
        await this.seedReference( belongsTo, seed, idsMap, name, context );
      }));
    }));
  }

  /**
   *
   */
  private async seedReference( belongsTo: EntityReference, seed: any, idsMap: any, name: string, context:any ):Promise<void> {
    try {
      const refEntity = this.graphx.entities[belongsTo.type];
      if ( refEntity && _.has( seed, refEntity.singular() ) ) {
        const refName = _.get( seed, refEntity.singular() );
        const refId = _.get( idsMap, [refEntity.singular(), refName] );
        if ( refId ) await this.updateReference( idsMap, name, refEntity, refId, context );
      }
    }
    catch ( error ) {
      console.error( `Entity '${this.name()}' could not seed a reference`, belongsTo, name, error );
    }
  }

  /**
   *
   */
  private async updateReference( idsMap: any, name: string, refEntity: EntityBuilder, refId: string, context:any ) {
    const id = _.get( idsMap, [this.singular(), name] );
    const entity = await this.resolver.resolveType( this, {}, { id }, context );
    _.set( entity, `${refEntity.singular()}Id`, _.toString(refId) );
    const args = _.set( {}, this.singular(), entity );
    await this.resolver.saveEntity( this, {}, args, context );
  }

  /*
   *  Permissions
   */



  /**
   * IDEA refactor out into seperate module
   */
  async getPermittedIds( action:CrudAction, context:any ):Promise<boolean|number[]> {
    if( ! this.isUserAndRolesDefined() ) return true;
    if( this.permissions() === null ) return true;
    const roles = this.getUserRoles( context );
    let ids:number[] = [];
    for( const role of roles ){
      const roleIds = await this.getPermittedIdsForRole( role, action, context );
      if( roleIds === true ) return true;
      if( roleIds ) ids = _.concat( ids, roleIds );
    }
    return _.uniq( ids );
  }

  /**
   * @returns true if all items can be accessed, false when none, or the array of ObjectIDs that accessible items must match
   */
  protected async getPermittedIdsForRole( role:string, action:CrudAction, context:any ):Promise<boolean|number[]> {
    let permissions = this.getActionPermissionsForRole( role, action );
    if( _.isBoolean( permissions ) ) return permissions;
    if( _.isString( permissions ) ) return this.getPermittedIdsForRole( permissions, action, context );
    let ids:number[][] = [];
    for( const permission of permissions as (string|object)[] ){
      const actionIds = await this.getIdsForActionPermission( role, permission, context );
      if( _.isBoolean( actionIds) ) {
        if( actionIds === false ) return false;
      } else ids.push( actionIds );
    }
    return _.intersection( ...ids );
  }

  /**
   *  @param permission if this is a string it will be handled as a reference to an action for the role
   *  in this or a belongsTo entity. If it is an object it is delegated to the resolver to use to return the
   *  permitted ids
   */
  protected async getIdsForActionPermission( role:string, permission:string|object, context:any ):Promise<boolean|number[]> {
    if( _.isString( permission ) ) return this.getIdsForReference( role, permission, context );
    return await this.resolver.getPermittedIds( this, permission, context );
  }

  /**
   *
   */
  protected async getIdsForReference( role:string, permissionReference:string, context:any ):Promise<boolean|number[]> {
    const entityAction = _.split( permissionReference, '.' );
    const action = _.last( entityAction );
    const entity = _.size( entityAction ) === 1 ? this : this.getBelongsToEntity( _.first( entityAction ) );
    return entity ? entity.getPermittedIdsForRole( role, action as CrudAction, context ) : false;
  }

  /**
   *
   */
  protected getBelongsToEntity( entity:undefined|string ):null|EntityBuilder {
    const entityIsBelongsTo = _.find( this.belongsTo(), refEntity => refEntity.type === entity );
    if( entityIsBelongsTo ) return this.graphx.entities[ entity as string ];
    console.warn(`'${entity}' is not a belongsTo of '${this.name}'`);
    return null;
  }

  /**
   *  everything defined for a role, can depend on the action or can be defined for all actions
   *
   *  @param role a role of the user
   *  @param action either create, read, update, delete
   *  @returns
   *    boolean - all allowed / unallowed
   *
   *    string - another role in this permissions to get the permitted ids
   *
   *    (string|object)[] - string - get permissions from action in this or a belongsTo entity for the same role
   *                      - object - create filter for query as described below
   *
   *  ### Filter for query:
   *  ```
   *    attributeA: value
   *  ```
   *  becomes `{ attributeA: { $eq: value } }`
   *
   *  ---
   *
   *  ```
   *    attributeB:
   *      - value1
   *      - value2
   *      - value3
   *  ```
   *  becomes `{ attributeB: { $in [value1, value2, value3] } }`
   *
   *
   *  ### Examples
   *  ```
   *  entity:
   *    Contract:
   *      attributes:
   *        name: string
   *        status: string
   *      belongsTo:
   *        - Car
   *      permissions:
   *        admin: true                 # all actions, everything permitted
   *        guest: false                # all actions, nothing permitted
   *        user: admin                 # all actions the same as for role 'admin'
   *        roleA:
   *          all: true                 # all actions, everything permitted, same as roleA: true
   *        roleB:
   *          all: false                # all actions, nothing permitted - same as roleB: false, pointless
   *          read: true                # except reading is allowed
   *        roleC:
   *          read: true                # reading of all items allowed
   *          create: read              # same as read
   *          update: read              # same as read
   *          delete: false             # no items allowed to delete
   *        roleD:
   *          all:
   *            name: 'Example'
   *          delete: roleC
   *        roleE:
   *          all:
   *            - name: 'Example'
   *        roleF:
   *          read:
   *            - name: 'Example'
   *              status: 'open'
   *          all:
   *            - read
   *            - status:
   *              - draft
   *              - open
   *              name: user.assignedContracts  # will be resolved with context
   *        roleG:
   *          all:
   *            name:
   *              - Example1
   *              - Example2
   *            status:
   *              - open
   *              - draft
   *        roleH:
   *          all: Car.read             # same as in Car.permissions.roleD.read (Car must be a belongsTo)
   *                                    # permisions in Car could also delegate to another belongsTo entity
   *        roleI:
   *          create: false
   *          all:
   *            name: 'Example'         # read, update, delete allowed for all items with { name: { $eq: "Example" } }
   *        roleJ:
   *          all:
   *            - Car.read               # all actions same as defined in Car.read
   *            - name: 'Example'        # and all items with { name: { $eq: "Example" } }
   *        roleK:
   *          all:
   *            - filter: '{ $and: { name: { $eq: "foo", $neq: "bar" }, { status: { $in officialStatus }} }}'
   * ```
   *
   */
  private getActionPermissionsForRole(role:string, action:CrudAction):boolean | string | (string|object)[]  {
    const permissions = _.get( this.permissions(), role );
    if( _.isBoolean( permissions ) || _.isString( permissions ) ) return permissions;
    let actionPermission = _.get( permissions, action );
    if( ! actionPermission ) actionPermission = _.get( permissions, "all" );
    if( ! actionPermission ) return false;
    if( _.isArray( actionPermission ) ) return actionPermission;
    if( _.isObject( actionPermission ) || _.isString( actionPermission) ) return [actionPermission];
    console.warn(`unexpected permission for role '${role}', action '${action}'`, actionPermission );
    return false;
  }

  /**
   *
   */
  protected isUserAndRolesDefined():boolean {
    return this.gorConfig.contextUser != null && this.gorConfig.contextRoles != null;
  }

  /**
   *
   */
  protected getUserRoles( context:any ):string[] {
    const user = _.get( context, this.gorConfig.contextUser as string );
    if( ! user ) throw "should not happen, no user in context";
    let roles:any = _.get( user, this.gorConfig.contextRoles as string );
    if( ! roles ) throw new AuthenticationError( `User has no role - ${JSON.stringify( user ) }` );
    return _.isArray( roles ) ? roles : [roles];
  }
}
