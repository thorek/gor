import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLList } from 'graphql';
import * as inflection from 'inflection';
import * as _ from 'lodash';
import { Collection, Db, FilterQuery, ObjectId } from 'mongodb';

import { GraphX } from './graphx';
import { EntityReference, SchemaType } from './schema-type';

/**
 * Base class for all Entities
 */
export abstract class EntityType extends SchemaType {

	get belongsTo(): EntityReference[] { return [] }
	get hasMany(): EntityReference[] { return [] }
	get plural() { return inflection.pluralize( _.toLower( this.name ) ) }
	get singular() { return _.toLower( this.name ) }

  get label() { return inflection.titleize(  this.plural ) }
  get path() { return this.plural }
  get parent():string|null { return null }

	protected collection:Collection<any>;

	//
	//
	constructor( protected db:Db ){
		super();
		this.collection = this.db.collection( this.plural );
	}

	//
	//
	init( graphx:GraphX ):void {
		super.init( graphx );
    this.graphx.entities[this.name] = this;
	}

	//
	//
	protected createObjectType():void {
		const name = this.typeName;
		this.graphx.type( name, { name, fields: () => {
			const fields = {  id: { type: GraphQLID } };
			this.setAttributes( fields );
			return fields;
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
		this.graphx.type(this.typeName).extend( () => {
			const fields = {};
			_.forEach( this.belongsTo, ref => {
				const refType = this.graphx.entities[ref.type];
				if( ! (refType instanceof EntityType) ) return console.warn( `'${this.typeName}:belongsTo': no such entity type '${ref.type}'` );
				const refObjectType = this.graphx.type(refType.typeName)
				if( ! refObjectType ) return console.warn( `'${this.typeName}:belongsTo': no objectType in '${ref.type}'` );
				_.set( fields, refType.singular, {
					type: refObjectType,
					resolve: (root:any ) => this.typeResolver( refType.collection, _.get( root, `${refType.singular}Id`) )
				});
			});
			return fields;
		});
	}

	//
	//
	protected addHasMany():void {
		this.graphx.type(this.typeName).extend( () => {
			const fields = {};
			_.forEach( this.hasMany, ref => {
				const refType = this.graphx.entities[ref.type];
				if( ! (refType instanceof EntityType) ) return console.warn( `'${this.typeName}:hasMany': no such entity type '${ref.type}'` );
				const refObjectType = this.graphx.type(refType.typeName)
				if( ! refObjectType ) return console.warn( `'${this.typeName}:hasMany': no objectType in '${ref.type}'` );
				_.set( fields, refType.plural, {
					type: new GraphQLList( refObjectType ),
					resolve: (root:any) => this.typesResolver( refType.collection, _.set(
						{}, [`attrs.${this.singular}Id`], _.toString( root.id ) ) )
				});
			});
			return fields;
		});
	}


	//
	//
	protected createInputType():void {
		const name = `${this.typeName}Input`;
		this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
			const fields = { id: { type: GraphQLID }};
			this.setAttributes( fields );
			return fields;
		}});
	}

	//
	//
	protected setAttributes( fields:any ):void {
		_.forEach( this.getAttributes(), (attribute,name) => {
			_.set( fields, name, { type: attribute.getType()} );
		});
	}


	//
	//
	protected createFilterType():void {
		const name = `${this.typeName}Filter`;
		this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
			const fields = { id: { type: GraphQLID } };
			_.forEach( this.getAttributes(), (attribute,name) => {
				_.set( fields, name, { type: attribute.getFilterInputType() } );
			});
			return fields;
		} });
	}

	//
	//
	protected addTypeQuery(){
		this.graphx.type( 'query' ).extend( () => {
			return _.set( {}, this.singular, {
				type: this.graphx.type(this.typeName),
				args: { id: { type: GraphQLID } },
				resolve: (root:any, args:any) => this.typeResolver( this.collection, args.id )
			});
    });
	}

	//
	//
	protected addTypesQuery(){
		this.graphx.type( 'query' ).extend( () => {
			return _.set( {}, this.plural, {
				type: new GraphQLList( this.graphx.type(this.typeName) ),
				args: { filter: { type: this.graphx.type(`${this.typeName}Filter`) } },
				resolve: (root:any, args:any) => this.typesResolver( this.collection, this.getFilter( args ) )
			});
		});
	}

	//
	//
	protected async typeResolver( collection:Collection, id:string ):Promise<any> {
		const entity = await collection.findOne( new ObjectId(id));
		return this.getOutEntity( entity );
	}

	//
	//
	protected async typesResolver( collection:Collection, filter:FilterQuery<any> ):Promise<any> {
		_.set( filter, 'deleted', { $ne: true } );
		const entities = await collection.find( filter ).toArray();
		return _.map( entities, entity => this.getOutEntity( entity ) );
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
	protected getFilter( args:any ):FilterQuery<any> {
		const filter:FilterQuery<any> = {};
		_.forEach( _.get( args, 'filter'), (condition, field) => {
			const attribute = this.getAttribute(field);
			if( ! attribute ) return;
			const filterType = attribute.getFilterAttributeType();
			const expression = filterType ? filterType.getFilterExpression( condition, field ) : null;
			if( expression ) filter[`attrs.${field}`] = expression;
		});
		return filter;
	}

	//
	//
	protected addSaveMutation():void {
		this.graphx.type( 'mutation' ).extend( () => {
      const mutation = {};
      const args = {};
      _.set( args, this.singular, { type: this.graphx.type(`${this.typeName}Input`)} );
			_.set( mutation, `save${this.typeName}`, {
				type: this.graphx.type( this.typeName ),
				args,
				resolve: (root:any, args:any ) => {
					const attrs = _.get( args, this.singular );
					return _.has( attrs, 'id' ) ? this.updateEntity( attrs ) : this.createEntity( attrs );
				}
			});
			return mutation;
		});
	}

	//
	//
	protected addDeleteMutation():void {
		this.graphx.type( 'mutation' ).extend( () => {
			const mutation = {};
			_.set( mutation, `delete${this.typeName}`, {
				type: GraphQLBoolean,
				args: { id: { type: GraphQLID } },
				resolve: (root:any, args:any ) => {
					return this.deleteEntity( args.id );
				}
			});
			return mutation;
		});
	}

	//
	//
	protected async updateEntity( attrs: any ):Promise<any> {
		const id = new ObjectId( attrs.id );
		delete attrs.id;
		const entity:any = await this.collection.findOne( id );
		if( ! entity ) return null;
		_.merge( entity.attrs, attrs );
		if( ! entity.versions ) entity.versions = [];
		entity.versions.push( {attrs, createdAt: Date.now() } );
		const result = await this.collection.findOneAndReplace( id, entity );
		return this.getOutEntity( entity );
	}

	//
	//
	protected async createEntity( attrs: any ):Promise<any> {
		const doc = {attrs, versions: [{ attrs, createdAt: Date.now() }]};
		const result = await this.collection.insertOne(doc);
		const entity:any = await this.collection.findOne( new ObjectId(result.insertedId ) );
		return this.getOutEntity( entity );
	}

	//
	//
	protected async deleteEntity( id:string ):Promise<boolean> {
		const result = await this.collection.updateOne( {"_id": new ObjectId( id )}, {
			$set: { "deleted": true }
		});
		return true;
	}
}
