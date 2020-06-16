import ts from 'es6-template-strings';
import _ from 'lodash';
import { Collection, Db, FilterQuery, MongoClient, ObjectId } from 'mongodb';

import { FilterType } from '../graph-on-rails/builder/filter-type';
import { Resolver } from '../graph-on-rails/core/resolver';
import { Entity, EntityReference } from '../graph-on-rails/entities/entity';
import { CrudAction } from '../graph-on-rails/entities/entity-permissions';
import { EnumFilterType } from './filter/enum-filter-type';
import { IntFilterType } from './filter/int-filter-type';
import { StringFilterType } from './filter/string-filter-type';
import { ResolverContext } from '../graph-on-rails/core/resolver-context';

/**
 *
 */
export class MongoDbResolver extends Resolver {


  /**
   *
   */
	constructor( protected db:Db ){ super() }

  /**
   *
   */
  public static async create( config:{url:string, dbName:string} ):Promise<Resolver> {
    const db = await this.getDb( config );
    return new MongoDbResolver( db );
  }

  /**
   *
   */
  protected static async getDb( config:any ):Promise<Db> {
    const url = _.get( config, 'url' );
    if( ! url ) throw `please provide url`;
    const dbName = _.get( config, 'dbName' );
    if( ! dbName ) throw `please provide dbName`;
		const client = await MongoClient.connect( url, { useNewUrlParser: true, useUnifiedTopology: true } );
    return client.db(dbName);
  }

  /**
   *
   */
  async findById( entity:Entity, id:ObjectId|string ):Promise<any> {
    if( ! (id instanceof ObjectId) ) id = this.getObjectId( id, entity );
    const collection = this.getCollection( entity );
    const item = await collection.findOne( id );
		return this.buildOutItem( item );
  }

  /**
   *
   */
  async findByIds( entity:Entity, ids:(ObjectId|string)[] ):Promise<any> {
    ids = _.map( ids, id => this.getObjectId( id, entity ) );
    const collection = this.getCollection( entity );
		const items = await collection.find( {_id: { $in: ids }} ).toArray();
		return _.map( items, item => this.buildOutItem( item ) );
  }

  /**
   *
   */
  async findByExpression( entity:Entity, filter:any ):Promise<any[]> {
    const collection = this.getCollection( entity );
    const items = await collection.find( filter ).toArray();
		return _.map( items, item => this.buildOutItem( item ) );
  }

  /**
   *
   */
  async findByAttribute( entity:Entity, attrValue:{[name:string]:any} ):Promise<any[]> {
    const expression = { $and: _.map( attrValue, (value, attribute) => _.set({}, attribute, { $eq: value } ) ) };
    return this.findByExpression( entity, attrValue );
  }


  /**
   *
   */
  protected getCollection( entity:Entity ):Collection {
    return this.db.collection( entity.plural  );
  }

  /**
   *
   */
  getScalarFilterTypes():FilterType[] {
    return [
      new StringFilterType(),
      new IntFilterType()
    ]
  }

  /**
   *
   */
  getEnumFilterType( enumName: string ) {
    return new EnumFilterType( enumName );
  }

  /**
   *
   */
  async resolveType( entity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.args, 'id' );
    return this.findById( entity, id );
  }

  /**
   *
   */
  async resolveAssocToType( refType:Entity, resolverCtx:ResolverContext ):Promise<any> {
    if( refType.isPolymorph ) return this.resolveAssocToPolymorphType( refType, resolverCtx );
    const id = _.get( resolverCtx.root, refType.foreignKey );
    return this.findById( refType, id );
  }

  /**
   *
   */
  private async resolveAssocToPolymorphType( refType:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.root, refType.foreignKey );
    const polymorphType = refType.context.entities[_.get( resolverCtx.root, refType.typeField )];
    console.log( "resolveAssocToPolymorphType", polymorphType.typeName )
    const result = await this.findById( polymorphType, id );
    _.set( result, '__typename', polymorphType.typeName );
    return result;
  }

  /**
   *
   */
  async resolveAssocFromTypes( entity:Entity, refType:Entity, resolverCtx:ResolverContext ):Promise<any[]> {
    const attr = refType.isAssocToMany( entity ) ? entity.foreignKeys : entity.foreignKey;
    const filter = _.set({}, attr, _.toString(resolverCtx.root.id) );
    return this.findByExpression( refType, filter );
  }

  /**
   *
   */
  async resolveAssocToManyTypes( entity:Entity, refType:Entity, resolverCtx:ResolverContext ):Promise<any[]> {
    const foreignKeys = _.map( _.get( resolverCtx.root, refType.foreignKeys ), foreignKey => new ObjectId( foreignKey ) );
    const filter = { _id: { $in: foreignKeys } };
    return this.findByExpression( refType, filter );
  }

  /**
   *
   */
  async resolveTypes( entity:Entity, resolverCtx:ResolverContext ):Promise<any[]> {
    let filter = this.getFilterQuery( entity, resolverCtx );
    filter = await this.addPermissions( entity, "read", filter, resolverCtx );
    return this.findByExpression( entity, filter );
  }

  /**
   *
   */
  async saveEntity( entity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const attrs = _.get( resolverCtx.args, entity.singular );
    return _.has( attrs, 'id' ) ?
      this.updateEntity( entity, attrs, resolverCtx ) :
      this.createEntity( entity, attrs, resolverCtx );
  }

  /**
   *
   */
	protected getFilterQuery( entity:Entity, resolverCtx:ResolverContext ):FilterQuery<any> {
    const filter = _.get( resolverCtx.args, 'filter');
    const filterQuery:FilterQuery<any> = {};
		_.forEach( filter, (condition, field) => {
      const attribute = entity.getAttribute(field);
			if( ! attribute ) return;
      const filterType = entity.context.filterType( attribute.filterType, attribute.graphqlType );
      if( ! filterType ) return;
			const expression = filterType.getFilterExpression( condition, field );
			if( expression ) _.set( filterQuery, field, expression );
    });
		return filterQuery;
	}

	//
	//
	protected buildOutItem( entity:any ):any {
    if( ! _.has( entity, '_id' ) ) return null;
    _.set( entity, 'id', entity._id );
    _.unset( entity, '_id' );
    return entity;
	}


	//
	//
	protected async updateEntity( entity:Entity, attrs: any, resolverCtx:ResolverContext ):Promise<any> {
    const _id = new ObjectId( attrs.id );
    delete attrs.id;
    const collection = this.getCollection( entity );
    const result = await collection.updateOne( { _id }, { $set: attrs }, { upsert: false } );
    return this.findById( entity, _id );
	}

	//
	//
	protected async createEntity( entity:Entity, attrs: any, context: any ):Promise<any> {
    const collection = this.getCollection( entity );
    for( const assocTo of entity.assocToInput ){
      await this.addInlineInput( entity, assocTo, attrs, context );
    }
    const result = await collection.insertOne( attrs );
    return this.findById( entity, result.insertedId );
	}

  /**
   *
   */
  private async addInlineInput( entity: Entity, assocTo: EntityReference, attrs: any, context: any ) {
    const refEntity = entity.context.entities[assocTo.type];
    const input = _.get( attrs, refEntity.singular );
    if( ! input ) return;
    if ( _.has( attrs, refEntity.foreignKey ) ) throw new Error(
      `'${entity.name} you cannot have '${refEntity.foreignKey}' if you provide inline input'` );
    const item = await this.createEntity( refEntity, input, context );
    _.set( attrs, refEntity.foreignKey, _.toString( item.id ) );
    _.unset( attrs, refEntity.singular );
  }

  /**
   *
   */
	async deleteEntity( entityType:Entity, resolverCtx:ResolverContext  ):Promise<boolean> {
    const collection = this.getCollection( entityType );
    const id = _.get( resolverCtx.args, 'id' );
    collection.deleteOne( { "_id": new ObjectId( id ) } );
		return true;
  }

  /**
   *
   */
  async dropCollection( entity:Entity ):Promise<boolean> {
    const collectionName = entity.plural;
    if( await this.collectionExist( collectionName ) ) try {
      await this.db.dropCollection( collectionName );
      return true;
    } catch (error) {
      console.error( error );
    }
    return false;
  }

  /**
   *
   */
  async collectionExist( name:string ):Promise<boolean> {
    const collection = await this.db.listCollections({name}).next();
    return collection != null;
  }

  /**
   *
   */
  protected async addPermissions( entity:Entity, action:CrudAction, filter:any, resolverCtx:ResolverContext ):Promise<any> {
    let ids = await entity.getPermittedIds( action, resolverCtx );
    if( ids === true ) return filter;
    if( ids === false ) ids = [];
    return { $and: [ { _id: { $in: ids } }, filter ] };
  }

  /**
   *
   */
  async getPermittedIds( entity:Entity, permission:object, resolverCtx:ResolverContext ):Promise<number[]> {
    let expression:string|object = _.get( permission, 'filter' );
    if( _.isString( expression ) ) {
      expression = ts( expression, resolverCtx.context );
      expression = JSON.parse( expression as string );
    } else {
      expression = this.buildPermittedIdsFilter( entity, permission, resolverCtx.context );
    }
    const result = await this.findByExpression( entity, expression );
    return _.map( result, item => _.get(item, '_id' ) );
  }

  /**
   *
   */
  async getPermittedIdsForForeignKeys( entity:Entity, assocTo:string, foreignKeys:any[] ):Promise<number[]> {
    foreignKeys = _.map( foreignKeys, key => key.toString() );
    const expression = _.set({}, assocTo, { $in: foreignKeys } );
    const result = await this.findByExpression( entity, expression );
    return _.map( result, item => _.get(item, '_id' ) );
  }

  /**
   *  all:
   *    - read
   *    - status:
   *        - draft
   *        - open
   *      name: user.assignedContracts  # will be resolved with context
   */
  private buildPermittedIdsFilter( entity:Entity, permission:object, context:any ):object {
    const conditions:any[] = [];
    _.forEach( permission, (values:any|any[], attribute:string) => {
      if( _.isArray( values ) ) {
        values = _.map( values, value => _.get( context, value, value ) );
        conditions.push( _.set( {}, attribute, { $in: values } ) );
      } else {
        values = this.resolvePermissionValue( entity, attribute, values, context );
        if( attribute === '_id' ) values = new ObjectId(values);
        conditions.push( _.set( {}, attribute, { $eq: values } ) );
      }
    });
    return _.size( conditions ) > 1 ? { $and: conditions } : _.first( conditions );
  }

  /**
   *
   */
  private resolvePermissionValue( entity:Entity, attribute:string, value:any, context:any ):any {
    value = _.get( context, value, value );
    return attribute === '_id' || entity.isAssocToAttribute( attribute ) ? new ObjectId( value ) : value;
  }

  /**
   *
   */
  getObjectId( id:any, entity:Entity ):ObjectId {
    if( ! id ) throw new Error(`cannot resolve type '${entity.name}' without id`);
    try {
      return new ObjectId( _.toString( id ) );
    } catch (error) {
      throw new Error( `could not convert '${id}' for '${entity.name}' to an ObjectId` );
    }
  }

}
