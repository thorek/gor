import _ from 'lodash';
import { Collection, Db, FilterQuery, ObjectId } from 'mongodb';

import { EntityType } from '../core/entity-type';
import { Resolver } from '../core/resolver';
import { GraphQLList, GraphQLObjectType } from 'graphql';

/**
 *
 */
export class VersionedMongoDbResolver extends Resolver {

  /**
   *
   * @param db
   */
	constructor( protected db:Db ){ super() }

  /**
   *
   */
  extendType( entityType:EntityType ):void { 
    // const objectType = entityType.graphx.type(entityType.typeName);
		// objectType.extend( () => (
    //   { versions: {
    //       type: new GraphQLList(  ),
    //       resolve: (root:any, args:any ) => null //([{foo: 0, bar: "Eins"},{foo: 1, bar: "Zwei"},{foo: 2, bar: "Drei"}])
    //     }
		//   }));
  }

  /**
   *
   */
  protected getCollection( entityType:EntityType ):Collection {
    return this.db.collection( entityType.plural );
  }

  /**
   *
   */
  async resolveType( entityType:EntityType, root:any, args:any ):Promise<any> {
    const collection = this.getCollection( entityType );
    const id = _.get( args, 'id' );
		const entity = await collection.findOne( new ObjectId(id));
		return this.getOutEntity( entity );
  }

  /**
   *
   */
  async resolveRefType( refType:EntityType, root:any, args:any ):Promise<any> {
    const collection = this.getCollection( refType );
    const id = _.get( root, `${refType.singular}Id`);
		const entity = await collection.findOne( new ObjectId(id) );
		return this.getOutEntity( entity );
  }


  /**
   *
   */
  async resolveRefTypes( entityType:EntityType, refType:EntityType, root:any, args:any ):Promise<any[]> {
    const collection = this.getCollection( refType );
    const filter = _.set( {}, [`attrs.${entityType.singular}Id`], _.toString( root.id ) );
		const entities = await collection.find( filter ).toArray();
		return _.map( entities, entity => this.getOutEntity( entity ) );
  }

  /**
   *
   */
  async resolveTypes( entityType:EntityType, root:any, args:any ):Promise<any[]> {
    const collection = this.getCollection( entityType );
    const filter = this.getFilter( entityType, root, args );
    _.set( filter, 'deleted', { $ne: true } );
		const entities = await collection.find( filter ).toArray();
		return _.map( entities, entity => this.getOutEntity( entity ) );
  }

  /**
   *
   */
  async saveEntity( entityType:EntityType, root:any, args:any ):Promise<any> {
    const attrs = _.get( args, entityType.singular );
    return _.has( attrs, 'id' ) ? this.updateEntity( entityType, attrs ) : this.createEntity( entityType, attrs );
  }

  /**
   *
   */
	protected getFilter( entityType:EntityType, root:any, args:any ):FilterQuery<any> {
		const filter:FilterQuery<any> = {};
		_.forEach( _.get( args, 'filter'), (condition, field) => {
			const attribute = entityType.getAttribute(field);
			if( ! attribute ) return;
			const filterType = attribute.getFilterAttributeType();
			const expression = filterType ? filterType.getFilterExpression( condition, field ) : null;
			if( expression ) filter[`attrs.${field}`] = expression;
		});
		return filter;
	}

	//
	//
	protected getOutEntity( entity:any ):any {
    const outEntity = _.get( entity, 'attrs' );
    if( _.isNil( outEntity ) ) return;
    return _.set( outEntity, 'id', entity._id );
	}


	//
	//
	protected async updateEntity( entityType:EntityType, attrs: any ):Promise<any> {
		const id = new ObjectId( attrs.id );
    delete attrs.id;
    const collection = this.getCollection( entityType );
		const entity:any = await collection.findOne( id );
		if( ! entity ) return null;
		_.merge( entity.attrs, attrs );
		if( ! entity.versions ) entity.versions = [];
		entity.versions.push( {attrs, createdAt: Date.now() } );
		const result = await collection.findOneAndReplace( id, entity );
		return this.getOutEntity( entity );
	}

	//
	//
	protected async createEntity( entityType:EntityType, attrs: any ):Promise<any> {
    const doc = {attrs, versions: [{ attrs, createdAt: Date.now() }]};
    const collection = this.getCollection( entityType );
		const result = await collection.insertOne(doc);
		const entity:any = await collection.findOne( new ObjectId(result.insertedId ) );
		return this.getOutEntity( entity );
	}

  /**
   *
   */
	async deleteEntity( entityType:EntityType, root:any, args:any  ):Promise<boolean> {
    const collection = this.getCollection( entityType );
    const id = _.get( args, 'id' );
		const result = await collection.updateOne( {"_id": new ObjectId( id )}, {
			$set: { "deleted": true }
		});
		return true;
	}
}
