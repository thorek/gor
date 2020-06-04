import _ from 'lodash';
import ts from 'es6-template-strings';

import { Collection, Db, FilterQuery, ObjectId, MongoClient } from 'mongodb';
import { CrudAction } from '../graph-on-rails/entities/entity-permissions';
import { Resolver } from '../graph-on-rails/core/resolver';
import { EnumFilterTypeBuilder } from './filter/enum-filter-type-builder';
import { GraphX } from '../graph-on-rails/core/graphx';
import { StringFilterTypeBuilder } from './filter/string-filter-type-builder';
import { IntFilterTypeBuilder } from './filter/int-filter-type-builder';
import { Entity } from '../graph-on-rails/entities/entity';

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
  protected getCollection( entity:Entity ):Collection {
    return this.db.collection( entity.plural  );
  }

  /**
   *
   */
  getScalarFilterTypes() {
    return [
      new StringFilterTypeBuilder(),
      new IntFilterTypeBuilder()
    ];
  }

  /**
   *
   */
  addEnumFilterAttributeType( name: string, graphx:GraphX ) {
    const efat =  new EnumFilterTypeBuilder( name );
    efat.init( graphx );
    efat.createTypes();
  }



  /**
   *
   */
  async resolveType( entity:Entity, root:any, args:any, context:any ):Promise<any> {
    const collection = this.getCollection( entity );
    const id = this.getObjectId( _.get( args, 'id' ), entity );
		const item = await collection.findOne( id );
		return this.buildOutItem( item );
  }

  /**
   *
   */
  async resolveRefType( refType:Entity, root:any, args:any, context:any ):Promise<any> {
    const collection = this.getCollection( refType );
    const id = this.getObjectId( _.get( root, refType.foreignKey ), refType );
		const item = await collection.findOne( id );
		return this.buildOutItem( item );
  }

  /**
   *
   */
  async resolveRefTypes( entity:Entity, refType:Entity, root:any, args:any, context:any ):Promise<any[]> {
    const collection = this.getCollection( refType );
    const filter = _.set( {}, [entity.foreignKey], _.toString( root.id ) );
		const items = await collection.find( filter ).toArray();
		return _.map( items, item => this.buildOutItem( item ) );
  }

  /**
   *
   */
  async resolveBelongsToManyTypes( entity:Entity, refType:Entity, root:any, args:any, context:any ):Promise<any[]> {
    const collection = this.getCollection( refType );
    const foreignKeys = _.map( _.get( root, refType.foreignKeys ), foreignKey => new ObjectId( foreignKey ) );
    const filter = { _id: { $in: foreignKeys } };
		const items = await collection.find( filter ).toArray();
		return _.map( items, item => this.buildOutItem( item ) );
  }

  /**
   *
   */
  async resolveTypes( entity:Entity, root:any, args:any, context:any ):Promise<any[]> {
    const collection = this.getCollection( entity );
    let filter = this.getFilterQuery( entity, root, args, context );
    _.set( filter, 'deleted', { $ne: true } );
    filter = await this.addPermissions( entity, "read", filter, context );
		const items = await collection.find( filter ).toArray();
		return _.map( items, item => this.buildOutItem( item ) );
  }

  /**
   *
   */
  async saveEntity( entity:Entity, root:any, args:any, context:any ):Promise<any> {
    const attrs = _.get( args, entity.singular );
    return _.has( attrs, 'id' ) ?
      this.updateEntity( entity, attrs, context ) :
      this.createEntity( entity, attrs, context );
  }

  /**
   *
   */
	protected getFilterQuery( entity:Entity, root:any, args:any, context:any ):FilterQuery<any> {
    const filter = _.get( args, 'filter');
    const filterQuery:FilterQuery<any> = {};
		_.forEach( filter, (condition, field) => {
      const attribute = entity.getAttribute(field);
			if( ! attribute ) return;
			const filterType = attribute.getFilterAttributeType();
			const expression = filterType ? filterType.getFilterExpression( condition, field ) : null;
			if( expression ) filterQuery[`${field}`] = expression;
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
	protected async updateEntity( entity:Entity, attrs: any, context: any ):Promise<any> {
    const _id = new ObjectId( attrs.id );
    delete attrs.id;
    const collection = this.getCollection( entity );
    const result = await collection.updateOne( { _id }, { $set: attrs }, { upsert: false } );
		return this.resolveType( entity, {}, { id: _id }, context );
	}

	//
	//
	protected async createEntity( entity:Entity, attrs: any, context: any ):Promise<any> {
    const collection = this.getCollection( entity );
		const result = await collection.insertOne( attrs );
		const item:any = await collection.findOne( new ObjectId(result.insertedId ) );
		return this.buildOutItem( item );
	}

  /**
   *
   */
	async deleteEntity( entityType:Entity, root:any, args:any, context:any  ):Promise<boolean> {
    const collection = this.getCollection( entityType );
    const id = _.get( args, 'id' );
		const result = await collection.updateOne( {"_id": new ObjectId( id )}, {
			$set: { "deleted": true }
		});
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
  async query( entity:Entity, expression:any ):Promise<any[]> {
    try {
      return await this.getCollection( entity ).find( expression ).toArray();
    } catch (error) {
      console.error( `could not query on collection '${entity.name}'`, expression, error );
    }
    return [];
  }

  /**
   *
   */
  protected async addPermissions( entity:Entity, action:CrudAction, filter:any, context:any ):Promise<any> {
    let ids = await entity.getPermittedIds( action, context );
    if( ids === true ) return filter;
    if( ids === false ) ids = [];
    return { $and: [ { _id: { $in: ids } }, filter ] };
  }

  /**
   *
   */
  async getPermittedIds( entity:Entity, permission:object, context:any ):Promise<number[]> {
    let expression:string|object = _.get( permission, 'filter' );
    if( _.isString( expression ) ) {
      expression = ts( expression, context );
      expression = JSON.parse( expression as string );
    } else {
      expression = this.buildPermittedIdsFilter( entity, permission, context );
    }
    const result = await this.query( entity, expression );
    return _.map( result, item => _.get(item, '_id' ) );
  }

  /**
   *
   */
  async getPermittedIdsForForeignKeys( entity:Entity, belongsTo:string, foreignKeys:any[] ):Promise<number[]> {
    foreignKeys = _.map( foreignKeys, key => key.toString() );
    const expression = _.set({}, belongsTo, { $in: foreignKeys } );
    const result = await this.query( entity, expression );
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
    return attribute === '_id' || entity.isBelongsToAttribute( attribute ) ? new ObjectId( value ) : value;
  }

  /**
   *
   */
  getObjectId( id:any, entity:Entity ):ObjectId {
    if( ! id ) throw new Error(`cannot resolve type '${entity.name}' without id`);
    try {
      return new ObjectId( _.toString( id ) );
    } catch (error) {
      console.error( `could not convert '${id}' for '${entity.name}' to an ObjectId` );
      return new ObjectId(Number.MAX_SAFE_INTEGER * -1);
    }
  }

}
