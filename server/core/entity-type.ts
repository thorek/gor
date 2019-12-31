import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLInt } from 'graphql';
import inflection from 'inflection';
import _ from 'lodash';

import { GraphX } from './graphx';
import { Resolver } from './resolver';
import { EntityReference, SchemaType } from './schema-type';

/**
 * Base class for all Entities
 */
export abstract class EntityType extends SchemaType {

	get belongsTo(): EntityReference[] { return [] }
	get hasMany(): EntityReference[] { return [] }
	get plural() { return inflection.pluralize( _.toLower( this.name ) ) }
	get singular() { return _.toLower( this.name ) }

  get collection() { return this.plural }
  get entity() { return this.singular }
  get label() { return inflection.titleize(  this.plural )  }
  get path() { return this.plural }
  get parent():string|null { return null }


	//
	//
	constructor( protected resolver:Resolver ){ super() }

	//
	//
	init( graphx:GraphX ):void {
    super.init( graphx );
    this.resolver.init( this );
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
		this.graphx.type(this.typeName).extend( () => {
			const fields = {};
			_.forEach( this.belongsTo, ref => {
				const refType = this.graphx.entities[ref.type];
				if( ! (refType instanceof EntityType) ) return console.warn( `'${this.typeName}:belongsTo': no such entity type '${ref.type}'` );
				const refObjectType = this.graphx.type(refType.typeName)
				if( ! refObjectType ) return console.warn( `'${this.typeName}:belongsTo': no objectType in '${ref.type}'` );
				_.set( fields, refType.singular, {
					type: refObjectType,
          resolve: (root:any, args:any ) => this.resolver.resolveRefType( refType, root, args )
				});
			});
			return fields;
    });

    const inputType = `${this.typeName}Input`;
    this.graphx.type(inputType).extend( () => {
      const fields = {};
      _.forEach( this.belongsTo, ref => {
				const refType = this.graphx.entities[ref.type];
				if( ! (refType instanceof EntityType) ) return console.warn( `'${this.typeName}:belongsTo': no such entity type '${ref.type}'` );
				const refObjectType = this.graphx.type(refType.typeName)
				if( ! refObjectType ) return console.warn( `'${this.typeName}:belongsTo': no objectType in '${ref.type}'` );
				_.set( fields, `${refType.singular}Id`, { type: GraphQLID });
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
					resolve: (root:any, args:any ) => this.resolver.resolveRefTypes( this, refType, root, args )
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
				resolve: (root:any, args:any) => this.resolver.resolveType( this, root, args )
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
        resolve: (root:any, args:any) => this.resolver.resolveTypes( this, root, args )
			});
		});
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
				resolve: (root:any, args:any ) => this.resolver.saveEntity( this, root, args )
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
				resolve: (root:any, args:any ) => this.resolver.deleteEntity( this, root, args )
			});
			return mutation;
		});
	}


}
