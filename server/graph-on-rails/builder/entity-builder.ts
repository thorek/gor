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

import { GraphX } from '../core/graphx';
import { Entity, EntityReference, TypeAttribute } from '../entities/entity';
import { SchemaBuilder } from './schema-builder';

//
//
export class EntityBuilder extends SchemaBuilder {

  name() { return this.entity.name }
  get resolver() { return this.entity.gorContext.resolver() }
  attributes():{[name:string]:TypeAttribute} { return this.entity.attributes };

	//
	//
	constructor( public readonly entity:Entity ){
    super();
  }

	//
	//
	init( graphx:GraphX ):void {
    super.init( graphx );
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
    this.addBelongsTo();
    this.addBelongsToMany();
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
    const belongsTo = _.filter( this.entity.belongsTo, bt => this.checkReference( 'belongsTo', bt ) );
		this.graphx.type(this.entity.typeName).extend(
      () => _.reduce( belongsTo, (fields, ref) => this.addBelongsToReferenceToType( fields, ref ), {} ));
    this.graphx.type(this.entity.inputName).extend(
      () => _.reduce( belongsTo, (fields, ref) => this.addBelongsToForeignKeyToInput( fields, ref ), {} ));
  }

	//
	//
	protected addBelongsToMany():void {
    const belongsToMany = _.filter( this.entity.belongsToMany, bt => this.checkReference( 'belongsTo', bt ) );
		this.graphx.type(this.entity.typeName).extend(
      () => _.reduce( belongsToMany, (fields, ref) => this.addBelongsToManyReferenceToType( fields, ref ), {} ));
    this.graphx.type(this.entity.inputName).extend(
      () => _.reduce( belongsToMany, (fields, ref) => this.addBelongsToManyForeignKeysToInput( fields, ref ), {} ));
	}


  //
  //
  private addBelongsToForeignKeyToInput( fields:any, ref:EntityReference ):any {
    const refEntity = this.graphx.entities[ref.type];
    return _.set( fields, refEntity.foreignKey, { type: GraphQLID });
  }

  //
  //
  private addBelongsToManyForeignKeysToInput( fields:any, ref:EntityReference ):any {
    const refEntity = this.graphx.entities[ref.type];
    return _.set( fields, refEntity.foreignKeys, { type: GraphQLList( GraphQLID ) });
  }

  //
  //
  private addBelongsToReferenceToType( fields:any, ref:EntityReference ):any {
    const refEntity = this.graphx.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName);
    return _.set( fields, refEntity.singular, {
      type: refObjectType,
      resolve: (root:any, args:any, context:any ) => this.resolver.resolveRefType( refEntity, root, args, context )
    });
  }

  //
  //
  private addBelongsToManyReferenceToType( fields:any, ref:EntityReference ):any {
    const refEntity = this.graphx.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName);
    return _.set( fields, refEntity.plural, {
      type: refObjectType,
      resolve: (root:any, args:any, context:any ) => this.resolver.resolveRefType( refEntity, root, args, context )
    });
  }

	//
	//
	protected addHasMany():void {
    const hasMany = _.filter( this.entity.hasMany, hm => this.checkReference( 'hasMany', hm ) );
		this.graphx.type(this.entity.typeName).extend(
      () => _.reduce( hasMany, (fields, ref) => this.addHasManyReferenceToType( fields, ref ), {} ));
  }

  //
  //
  private addHasManyReferenceToType(fields:any, ref:EntityReference):any {
    const refEntity = this.graphx.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName)
    return _.set( fields, refEntity.plural, {
      type: new GraphQLList( refObjectType ),
      resolve: (root:any, args:any, context:any ) => this.resolver.resolveBelongsToManyTypes( this.entity, refEntity, root, args, context )
    });
  }

  //
  //
  private checkReference( direction:'belongsTo'|'hasMany', ref:EntityReference ):boolean {
    const refEntity = this.graphx.entities[ref.type];
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
