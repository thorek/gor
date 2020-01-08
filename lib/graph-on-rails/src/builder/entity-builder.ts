import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLList } from 'graphql';
import inflection from 'inflection';
import _ from 'lodash';

import { GraphX } from '../core/graphx';
import { Resolver } from '../core/resolver';
import { EntityReference, SchemaBuilder } from './schema-builder';

/**
 * Base class for all Entities
 */
export abstract class EntityBuilder extends SchemaBuilder {

	belongsTo(): EntityReference[] { return [] }
	hasMany(): EntityReference[] { return [] }
	plural() { return inflection.pluralize( _.toLower( this.name() ) ) }
	singular() { return _.toLower( this.name() ) }

  collection() { return this.plural() }
  instance() { return this.singular() }
  label() { return inflection.titleize(  this.plural() )  }
  path() { return this.plural() }
  parent():string | null { return null }


	//
	//
	constructor( protected resolver:Resolver ){ super() }

	//
	//
	init( graphx:GraphX ):void {
    super.init( graphx );
    this.resolver.init( this );
    this.graphx.entities[this.name()] = this;
	}

	//
	//
	protected createObjectType():void {
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
      const args = _.set( {}, this.singular(), { type: this.graphx.type(`${this.typeName()}Input`)} );
      return _.set( {}, `save${this.typeName()}`, {
				type: this.graphx.type( this.typeName() ),
				args,
				resolve: (root:any, args:any ) => this.resolver.saveEntity( this, root, args )
			});
		});
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

}
