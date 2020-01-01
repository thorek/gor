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
    const belongsTo = _.filter( this.belongsTo, bt => this.checkReference( 'belongsTo', bt ) );
		this.graphx.type(this.typeName).extend(
      () => _.reduce( belongsTo, (fields, ref) => this.addBelongsToReference( fields, ref ), {} ));
    this.graphx.type(`${this.typeName}Input`).extend(
      () => _.reduce( belongsTo, (fields, ref) => this.addBelongsToId( fields, ref ), {} ));
	}

  //
  //
  private addBelongsToId( fields:any, ref:EntityReference ):any {
    const refType = this.graphx.entities[ref.type];
    return _.set( fields, `${refType.singular}Id`, { type: GraphQLID });
  }

  //
  //
  private addBelongsToReference( fields:any, ref:EntityReference ):any {
    const refType = this.graphx.entities[ref.type];
    const refObjectType = this.graphx.type(refType.typeName);
    return _.set( fields, refType.singular, {
      type: refObjectType,
      resolve: (root:any, args:any ) => this.resolver.resolveRefType( refType, root, args )
    });
  }


	//
	//
	protected addHasMany():void {
    const hasMany = _.filter( this.hasMany, hm => this.checkReference( 'hasMany', hm ) );
		this.graphx.type(this.typeName).extend(
      () => _.reduce( hasMany, (fields, ref) => this.addHasManyReference( fields, ref ), {} ));
  }

  //
  //
  private addHasManyReference(fields:any, ref:EntityReference):any {
    const refType = this.graphx.entities[ref.type];
    const refObjectType = this.graphx.type(refType.typeName)
    return _.set( fields, refType.plural, {
      type: new GraphQLList( refObjectType ),
      resolve: (root:any, args:any ) => this.resolver.resolveRefTypes( this, refType, root, args )
    });
  }

  //
  //
  private checkReference( direction:'belongsTo'|'hasMany', ref:EntityReference ):boolean {
    const refType = this.graphx.entities[ref.type];
    if( ! (refType instanceof EntityType) ) {
      console.warn( `'${this.typeName}:${direction}': no such entity type '${ref.type}'` );
      return false;
    }
    if( ! this.graphx.type(refType.typeName) ) {
      console.warn( `'${this.typeName}:${direction}': no objectType in '${ref.type}'` );
      return false;
    }
    return true;
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
