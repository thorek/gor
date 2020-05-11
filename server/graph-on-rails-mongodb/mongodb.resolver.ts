import _ from 'lodash';
import { Collection, Db, FilterQuery, ObjectId, MongoClient } from 'mongodb';
import { EntityBuilder, Resolver } from 'graph-on-rails';
import { EnumFilterTypeBuilder } from './filter/enum-filter-type-builder';

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
  protected getCollection( entityType:EntityBuilder ):Collection {
    return this.db.collection( entityType.plural()  );
  }

  /**
   *
   */
  getScalarFilterTypes() {
    return [];
  }

  /**
   *
   */
  addEnumFilterAttributeType( name: string ) {
    const efat =  new EnumFilterTypeBuilder( name );
    // efat.init( this.g );
    efat.createTypes();
  }



  /**
   *
   */
  async resolveType( entityType:EntityBuilder, root:any, args:any ):Promise<any> {
    const collection = this.getCollection( entityType );
    const id = _.get( args, 'id' );
		const entity = await collection.findOne( new ObjectId(id));
		return this.getOutEntity( entity );
  }

  /**
   *
   */
  async resolveRefType( refType:EntityBuilder, root:any, args:any ):Promise<any> {
    const collection = this.getCollection( refType );
    const id = _.get( root, `${refType.singular()}Id`);
		const entity = await collection.findOne( new ObjectId(id) );
		return this.getOutEntity( entity );
  }


  /**
   *
   */
  async resolveRefTypes( entityType:EntityBuilder, refType:EntityBuilder, root:any, args:any ):Promise<any[]> {
    const collection = this.getCollection( refType );
    const filter = _.set( {}, [`${entityType.singular()}Id`], _.toString( root.id ) );
		const entities = await collection.find( filter ).toArray();
		return _.map( entities, entity => this.getOutEntity( entity ) );
  }

  /**
   *
   */
  async resolveTypes( entityType:EntityBuilder, root:any, args:any ):Promise<any[]> {
    const collection = this.getCollection( entityType );
    const filter = this.getFilterQuery( entityType, root, args );
    _.set( filter, 'deleted', { $ne: true } );
		const entities = await collection.find( filter ).toArray();
		return _.map( entities, entity => this.getOutEntity( entity ) );
  }

  /**
   *
   */
  async saveEntity( entityType:EntityBuilder, root:any, args:any ):Promise<any> {
    const attrs = _.get( args, entityType.singular() );
    return _.has( attrs, 'id' ) ? this.updateEntity( entityType, attrs ) : this.createEntity( entityType, attrs );
  }

  /**
   *
   */
	protected getFilterQuery( entityType:EntityBuilder, root:any, args:any ):FilterQuery<any> {
    const filter = _.get( args, 'filter');
    const filterQuery:FilterQuery<any> = {};
		_.forEach( filter, (condition, field) => {
      const attribute = entityType.getAttribute(field);
			if( ! attribute ) return;
			const filterType = attribute.getFilterAttributeType();
			const expression = filterType ? filterType.getFilterExpression( condition, field ) : null;
			if( expression ) filterQuery[`${field}`] = expression;
    });

		return filterQuery;
	}

	//
	//
	protected getOutEntity( entity:any ):any {
    _.set( entity, 'id', entity._id );
    _.unset( entity, '_id' );
    return entity;
	}


	//
	//
	protected async updateEntity( entityType:EntityBuilder, attrs: any ):Promise<any> {
		const id = new ObjectId( attrs.id );
    delete attrs.id;
    const collection = this.getCollection( entityType );
		const entity:any = await collection.findOne( id );
		if( ! entity ) return null;
		_.merge( entity, attrs );
		const result = await collection.findOneAndReplace( id, entity );
		return this.getOutEntity( entity );
	}

	//
	//
	protected async createEntity( entityType:EntityBuilder, attrs: any ):Promise<any> {
    const collection = this.getCollection( entityType );
		const result = await collection.insertOne( attrs );
		const entity:any = await collection.findOne( new ObjectId(result.insertedId ) );
		return this.getOutEntity( entity );
	}

  /**
   *
   */
	async deleteEntity( entityType:EntityBuilder, root:any, args:any  ):Promise<boolean> {
    const collection = this.getCollection( entityType );
    const id = _.get( args, 'id' );
		const result = await collection.updateOne( {"_id": new ObjectId( id )}, {
			$set: { "deleted": true }
		});
		return true;
	}
}
