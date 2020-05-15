import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLEnumType, GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import inflection from 'inflection';
import _ from 'lodash';

import { GraphX } from '../core/graphx';
import { Resolver } from '../core/resolver';
import { EntityReference, SchemaBuilder } from './schema-builder';
import { Validator, ValidatorFactory } from '../validation/validator';

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

  protected validator?:Validator;

	//
	//
	constructor(
      protected readonly resolver:Resolver,
      protected validatorFactory:ValidatorFactory ){
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
      resolve: (root:any, args:any ) => this.resolver.resolveRefType( refEntity, root, args )
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
      resolve: (root:any, args:any ) => this.resolver.resolveRefTypes( this, refEntity, root, args )
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
				resolve: (root:any, args:any) => this.resolver.resolveType( this, root, args )
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
        resolve: (root:any, args:any) => this.resolver.resolveTypes( this, root, args )
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
				type,	args, resolve: (root:any, args:any ) => this.saveEntity( root, args )
			});
		});
	}

  /**
   *
   */
  private async saveEntity( root: any, args: any ) {
    const errors = await this.validate( root, args );
    if( _.size( errors ) ) return { errors };
    return _.set( {errors: []}, this.singular(), this.resolver.saveEntity( this, root, args ) );
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
				resolve: (root:any, args:any ) => this.resolver.deleteEntity( this, root, args )
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
  public async seedAttributes():Promise<any> {
    const ids = {};
    await Promise.all( _.map( this.seeds(), (seed, name) => this.seedInstanceAttributes( name, seed, ids ) ) );
    return _.set( {}, this.singular(), ids );
  }

  /**
   *
   */
  private async seedInstanceAttributes( name:string, seed:any, ids:any ):Promise<any> {
    try {
      const args = _.set( {}, this.singular(), _.pick( seed, _.keys( this.attributes() ) ) );
      const entity = await this.resolver.saveEntity( this, {}, args );
      _.set( ids, name, entity.id );
    } catch (error) {
      console.error( `Entity '${this.name() }' could not seed an instance`, seed, error );
    }
  }

  /**
   *
   */
  public async seedReferences( idsMap:any ):Promise<void> {
    await Promise.all( _.map( this.seeds(), async (seed, name) => {
      await Promise.all( _.map( this.belongsTo(), async belongsTo => {
        await this.seedReference( belongsTo, seed, idsMap, name );
      }));
    }));
  }

  /**
   *
   */
  private async seedReference( belongsTo: EntityReference, seed: any, idsMap: any, name: string ):Promise<void> {
    try {
      const refEntity = this.graphx.entities[belongsTo.type];
      if ( refEntity && _.has( seed, refEntity.singular() ) ) {
        const refName = _.get( seed, refEntity.singular() );
        const refId = _.get( idsMap, [refEntity.singular(), refName] );
        if ( refId ) await this.updateReference( idsMap, name, refEntity, refId );
      }
    }
    catch ( error ) {
      console.error( `Entity '${this.name()}' could not seed a reference`, belongsTo, name, error );
    }
  }

  /**
   *
   */
  private async updateReference( idsMap: any, name: string, refEntity: EntityBuilder, refId: string ) {
    const id = _.get( idsMap, [this.singular(), name] );
    const entity = await this.resolver.resolveType( this, {}, { id } );
    _.set( entity, `${refEntity.singular()}Id`, _.toString(refId) );
    const args = _.set( {}, this.singular(), entity );
    await this.resolver.saveEntity( this, {}, args );
  }
}
