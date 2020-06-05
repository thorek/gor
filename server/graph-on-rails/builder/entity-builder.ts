import { GorContext } from 'graph-on-rails/core/gor-context';
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
import _ from 'lodash';

import { Entity, EntityReference, TypeAttribute } from '../entities/entity';
import { SchemaBuilder } from './schema-builder';

//
//
export class EntityBuilder extends SchemaBuilder {

  name() { return this.entity.name }
  attributes():{[name:string]:TypeAttribute} { return this.entity.attributes };

	//
	//
	constructor( public readonly entity:Entity ){
    super();
  }

  /**
   *
   */
  init( context:GorContext ){
    super.init( context );
    this.entity.init( context );
  }

	//
	//
	protected createEnums():void {
		_.forEach( this.entity.enum, (keyValues:any, name:string) => {
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
		const name = this.entity.typeName;
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
	}

	//
	//
	addReferences():void {
    this.addAssocTo();
    this.addAssocToMany();
		this.addAssocFrom();
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
	protected addAssocTo():void {
    const assocTo = _.filter( this.entity.assocTo, bt => this.checkReference( 'assocTo', bt ) );
		this.graphx.type(this.entity.typeName).extend(
      () => _.reduce( assocTo, (fields, ref) => this.addAssocToReferenceToType( fields, ref ), {} ));
    this.graphx.type(this.entity.inputName).extend(
      () => _.reduce( assocTo, (fields, ref) => this.addAssocToForeignKeyToInput( fields, ref ), {} ));
  }

	//
	//
	protected addAssocToMany():void {
    const assocToMany = _.filter( this.entity.assocToMany, bt => this.checkReference( 'assocTo', bt ) );
		this.graphx.type(this.entity.typeName).extend(
      () => _.reduce( assocToMany, (fields, ref) => this.addAssocToManyReferenceToType( fields, ref ), {} ));
    this.graphx.type(this.entity.inputName).extend(
      () => _.reduce( assocToMany, (fields, ref) => this.addAssocToManyForeignKeysToInput( fields, ref ), {} ));
	}


  //
  //
  private addAssocToForeignKeyToInput( fields:any, ref:EntityReference ):any {
    const refEntity = this.context.entities[ref.type];
    return _.set( fields, refEntity.foreignKey, { type: GraphQLID });
  }

  //
  //
  private addAssocToManyForeignKeysToInput( fields:any, ref:EntityReference ):any {
    const refEntity = this.context.entities[ref.type];
    return _.set( fields, refEntity.foreignKeys, { type: GraphQLList( GraphQLID ) });
  }

  //
  //
  private addAssocToReferenceToType( fields:any, ref:EntityReference ):any {
    const refEntity = this.context.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName);
    return _.set( fields, refEntity.singular, {
      type: refObjectType,
      resolve: (root:any, args:any, context:any ) => this.resolver.resolveAssocToType( refEntity, root, args, context )
    });
  }

  //
  //
  private addAssocToManyReferenceToType( fields:any, ref:EntityReference ):any {
    const refEntity = this.context.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName);
    return _.set( fields, refEntity.plural, {
      type: new GraphQLList( refObjectType),
      resolve: (root:any, args:any, context:any ) => this.resolver.resolveAssocToManyTypes( this.entity, refEntity, root, args, context )
    });
  }

	//
	//
	protected addAssocFrom():void {
    const assocFrom = _.filter( this.entity.assocFrom, assocFrom => this.checkReference( 'assocFrom', assocFrom ) );
		this.graphx.type(this.entity.typeName).extend(
      () => _.reduce( assocFrom, (fields, ref) => this.addAssocFromReferenceToType( fields, ref ), {} ));
  }

  //
  //
  private addAssocFromReferenceToType(fields:any, ref:EntityReference):any {
    const refEntity = this.context.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName)
    return _.set( fields, refEntity.plural, {
      type: new GraphQLList( refObjectType ),
      resolve: (root:any, args:any, context:any ) => this.resolver.resolveAssocFromTypes( this.entity, refEntity, root, args, context )
    });
  }

  //
  //
  private checkReference( direction:'assocTo'|'assocFrom', ref:EntityReference ):boolean {
    const refEntity = this.context.entities[ref.type];
    if( ! (refEntity instanceof Entity ) ) {
      console.warn( `'${this.entity.typeName}:${direction}': no such entity type '${ref.type}'` );
      return false;
    }
    if( ! this.graphx.type(refEntity.typeName) ) {
      console.warn( `'${this.entity.typeName}:${direction}': no objectType in '${ref.type}'` );
      return false;
    }
    return true;
  }

  /**
   *
   */
  protected createInputType():void {
		const name = this.entity.inputName;
		this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
			const fields = { id: { type: GraphQLID }};
			return this.setAttributes( fields );
		}});
	}

  /**
   *
   * @param fields
   */
  protected setAttributes( fields:any ):any {
		_.forEach( this.getAttributes(), (attribute,name) => {
			_.set( fields, name, { type: attribute.getType()} );
    });
    return fields;
	}

  /**
   *
   */
  protected createFilterType():void {
		const name = this.entity.filterName;
		this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
			const fields = { id: { type: GraphQLID } };
			_.forEach( this.getAttributes(), (attribute, name) => {
				_.set( fields, name, { type: attribute.getFilterInputType() } );
			});
			return fields;
		} });
	}

  /**
   *
   */
	protected addTypeQuery(){
		this.graphx.type( 'query' ).extend( () => {
			return _.set( {}, this.entity.singular, {
				type: this.graphx.type(this.entity.typeName),
				args: { id: { type: GraphQLID } },
				resolve: (root:any, args:any, context:any) => this.resolver.resolveType( this.entity, root, args, context )
			});
    });
	}

  /**
   *
   */
  protected addTypesQuery(){
		this.graphx.type( 'query' ).extend( () => {
			return _.set( {}, this.entity.plural, {
				type: new GraphQLList( this.graphx.type(this.entity.typeName) ),
				args: { filter: { type: this.graphx.type(this.entity.filterName) } },
        resolve: (root:any, args:any, context:any) => this.resolver.resolveTypes( this.entity, root, args, context )
			});
		});
	}

  /**
   *
   */
  protected addSaveMutation():void {
		this.graphx.type( 'mutation' ).extend( () => {
      const typeName = this.entity.typeName;
      const singular = this.entity.singular;
      const args = _.set( {}, this.entity.singular, { type: this.graphx.type(this.entity.inputName)} );
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
  private async  saveEntity( root: any, args: any, context:any ) {
    let errors = await this.entity.validate( root, args, context );
    if( _.size( errors ) ) return { errors };
    return _.set( {errors: []}, this.entity.singular, this.resolver.saveEntity( this.entity, root, args, context ) );
  }

  /**
   *
   */
	protected addDeleteMutation():void {
		this.graphx.type( 'mutation' ).extend( () => {
			return _.set( {}, `delete${this.entity.typeName}`, {
				type: GraphQLBoolean,
				args: { id: { type: GraphQLID } },
				resolve: (root:any, args:any, context:any ) => this.resolver.deleteEntity( this.entity, root, args, context )
			});
		});
  }

}
