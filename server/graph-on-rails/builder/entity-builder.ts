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
import { EntityPermissions, CrudAction } from './entity-permissions';

/**
 * Base class for all Entities
 */
export abstract class EntityBuilder extends SchemaBuilder {

	belongsTo(): EntityReference[] { return [] }
	hasMany(): EntityReference[] { return [] }
	singular() { return `${_.toLower(this.typeName().substring(0,1))}${this.typeName().substring(1)}` }
  plural() { return inflection.pluralize( this.singular() ) }
  foreignKey() { return `${this.singular()}Id` }

  collection() { return this.plural() }
  instance() { return this.singular() }
  label() { return inflection.titleize(  this.plural() )  }
  path() { return this.plural() }
  parent():string | null { return null }

  enum():{[name:string]:{[key:string]:string}} { return {} }
  seeds():{[name:string]:any} { return {} }
  permissions():null|{[role:string]:{[action:string]:boolean|string|string[]}} { return null }

  get resolver() { return this.gorConfig.resolver() }
  get validator() { if( this._validator ) return this._validator; throw "no validator" }
  get entityPermissions() { if( this._entityPermissions ) return this._entityPermissions; throw "no entityPermissions" }

  private _entityPermissions?:EntityPermissions;
  private _validator:Validator|undefined;


	//
	//
	constructor( public readonly gorConfig:GorConfig){
    super();
  }

	//
	//
	init( graphx:GraphX ):void {
    super.init( graphx );
    this.resolver.init( this );
    this.graphx.entities[this.name()] = this;
    this._validator = this.gorConfig.validator( this );
    this._entityPermissions = this.gorConfig.entityPermissions(this);
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
    return _.set( fields, refEntity.foreignKey(), { type: GraphQLID });
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

  /**
   *
   */
  isBelongsToAttribute( attribute:string ):boolean {
    return _.find( this.belongsTo(), bt => {
      const ref = this.graphx.entities[bt.type];
      return ref && ref.foreignKey() === attribute;
    }) != null;
  }

  /**
   *
   */
  async getPermittedIds( action:CrudAction, context:any ):Promise<boolean|number[]> {
    if( ! this.entityPermissions ) throw new Error("no EntityPermission provider" );
    return this.entityPermissions.getPermittedIds( action, context );
  }

}
