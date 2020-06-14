import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLType,
  GraphQLUnionType,
} from 'graphql';
import _ from 'lodash';

import { Context } from '../core/context';
import { Entity, EntityReference } from '../entities/entity';
import { TypeAttribute } from '../entities/type-attribute';
import { SchemaBuilder } from './schema-builder';

const typesMap:{[scalar:string]:GraphQLType} = {
  Id: GraphQLID,
  String: GraphQLString,
  Int: GraphQLInt,
  Float: GraphQLFloat,
  Boolean: GraphQLBoolean
}

type AttributePurpose = 'createInput'|'updateInput'|'filter'|'type';

type AttrFieldConfig = {
  type: GraphQLType
  description?:string
}

//
//
export class EntityBuilder extends SchemaBuilder {

  name() { return this.entity.name }
  get resolveHandler() { return this.entity.entityResolveHandler }
  attributes():{[name:string]:TypeAttribute} { return this.entity.attributes };

	//
	//
	constructor( public readonly entity:Entity ){
    super();
  }

  /**
   *
   */
  init( context:Context ){
    super.init( context );
    this.entity.init( context );
  }

	//
	//
	protected createObjectType():void {
    if( this.entity.isUnion ) return;
    const from = this.entity.isInterface ? GraphQLInterfaceType : GraphQLObjectType;
    const name = this.entity.typeName;
		this.graphx.type( name, {
      from, name,
      fields: () => {
			  const fields = { id: { type: new GraphQLNonNull(GraphQLID) } };
			  return _.merge( fields, this.getAttributeFields( 'type' ) );
      },
      description: this.entity.description
    });
  }

	//
	//
	extendTypes():void {
    this.createUnionType();
    this.createEntityTypesEnum();
    this.createCreateInputType();
    this.createUpdateInputType();
		this.createFilterType();
    this.addInterfaces();
		this.addReferences();
		this.addQueries();
    this.addMutations();
	}

  //
  //
  protected createUnionType():void {
    if( ! this.entity.isUnion ) return;
    const name = this.entity.typeName;
    this.graphx.type( name, {
      from: GraphQLUnionType,
      name,
      types: () => _.compact( _.map( this.entity.entities, entity => this.graphx.type(entity.typeName) ) ),
      description: this.entity.description
    });
  }

  //
  //
  protected createEntityTypesEnum():void {
    if( ! this.entity.isPolymorph ) return;
    const entities = this.entity.isUnion ?
      this.entity.entities :
      _.filter( this.context.entities, entity => entity.implementsEntityInterface( this.entity ) );
    const name = this.entity.typesEnumName;
    const values = _.reduce( entities,
      (values, entity) => _.set( values, entity.name, {value: entity.name } ), {}  );
    this.graphx.type( name, { name, values, from: GraphQLEnumType });
  }

	//
	//
	protected addInterfaces():void {
    if( _.isEmpty( this.entity.implements ) ) return;
    _.forEach( this.entity.implements, entity => this.addFieldsFromInterface( entity ) );
    _.set( this.graphx.type(this.entity.typeName), 'interfaceTypes',
      () => _.map( this.entity.implements, entity => this.graphx.type(entity.typeName)) );
	}

  //
  //
  protected addFieldsFromInterface( entity:Entity ):void {
    this.graphx.type(this.entity.typeName).extendFields( () => this.getAttributeFields( 'type', entity ) );
    this.graphx.type(this.entity.filterName).extendFields( () => this.getAttributeFields( 'filter', entity ) );
    this.graphx.type(this.entity.createInputTypeName).extendFields( () => this.getAttributeFields( 'createInput', entity ) );
    this.graphx.type(this.entity.updateInputTypeName).extendFields( () => this.getAttributeFields( 'updateInput', entity ) );
  }

	//
	//
	protected addReferences():void {
    this.addAssocTo();
    this.addAssocToMany();
		this.addAssocFrom();
	}

	//
	//
	protected addMutations():void {
    this.addSaveMutations();
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
		this.graphx.type(this.entity.typeName).extendFields(
      () => _.reduce( assocTo, (fields, ref) => this.addAssocToReferenceToType( fields, ref ), {} ));
    this.graphx.type(this.entity.createInputTypeName).extendFields(
      () => _.reduce( assocTo, (fields, ref) => this.addAssocToForeignKeyToInput( fields, ref ), {} ));
  }

	//
	//
	protected addAssocToMany():void {
    const assocToMany = _.filter( this.entity.assocToMany, bt => this.checkReference( 'assocTo', bt ) );
		this.graphx.type(this.entity.typeName).extendFields(
      () => _.reduce( assocToMany, (fields, ref) => this.addAssocToManyReferenceToType( fields, ref ), {} ));
    this.graphx.type(this.entity.createInputTypeName).extendFields(
      () => _.reduce( assocToMany, (fields, ref) => this.addAssocToManyForeignKeysToInput( fields, ref ), {} ));
	}


  //
  //
  private addAssocToForeignKeyToInput( fields:any, ref:EntityReference ):any {
    const refEntity = this.context.entities[ref.type];
    _.set( fields, refEntity.foreignKey, { type: GraphQLID });
    if( refEntity.isPolymorph ) _.set( fields, refEntity.typeField,
      { type: this.graphx.type( refEntity.typesEnumName ) } );
    return fields;
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
      resolve: (root:any, args:any, context:any ) => this.resolveHandler.resolveAssocToType( refEntity, {root, args, context} )
    });
  }

  //
  //
  private addAssocToManyReferenceToType( fields:any, ref:EntityReference ):any {
    const refEntity = this.context.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName);
    return _.set( fields, refEntity.plural, {
      type: new GraphQLList( refObjectType),
      resolve: (root:any, args:any, context:any ) =>
        this.resolveHandler.resolveAssocToManyTypes( refEntity, {root, args, context} )
    });
  }

	//
	//
	protected addAssocFrom():void {
    const assocFrom = _.filter( this.entity.assocFrom, assocFrom => this.checkReference( 'assocFrom', assocFrom ) );
		this.graphx.type(this.entity.typeName).extendFields(
      () => _.reduce( assocFrom, (fields, ref) => this.addAssocFromReferenceToType( fields, ref ), {} ));
  }

  //
  //
  private addAssocFromReferenceToType(fields:any, ref:EntityReference):any {
    const refEntity = this.context.entities[ref.type];
    const refObjectType = this.graphx.type(refEntity.typeName)
    return _.set( fields, refEntity.plural, {
      type: new GraphQLList( refObjectType ),
      resolve: (root:any, args:any, context:any ) =>
        this.resolveHandler.resolveAssocFromTypes( refEntity, {root, args, context} )
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
  protected createCreateInputType():void {
		const name = this.entity.createInputTypeName;
		this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => this.getAttributeFields( 'createInput' ) });
	}

  /**
   *
   */
  protected createUpdateInputType():void {
		const name = this.entity.updateInputTypeName;
		this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
			const fields = { id: { type: new GraphQLNonNull(GraphQLID) }};
			return _.merge( fields, this.getAttributeFields( 'updateInput' ) );
		}});
	}

  /**
   *
   */
  protected getAttributeFields( purpose:AttributePurpose, entity?:Entity,  ):any {
    const attributes = entity ? entity.attributes : this.attributes();
    const fields = _.mapValues( attributes, (attribute, name) => this.getFieldConfig(name, attribute, purpose));
    return _.pickBy( fields, _.identity);
  }

  //
  //
  private getFieldConfig(name:string, attribute:TypeAttribute, purpose:AttributePurpose ):AttrFieldConfig|undefined {
    const addNonNull = this.addNonNull( name, attribute, purpose);
    const fieldConfig = {
      type: this.getGraphQLType(attribute, addNonNull ),
      description: attribute.description
    };
    if( this.skipVirtual( name, attribute, purpose, fieldConfig ) ) return;
    return fieldConfig;
  }

  //
  //
  private addNonNull( name:string, attribute:TypeAttribute, purpose:AttributePurpose ):boolean {
    if( ! attribute.required || purpose === 'filter' ) return false;
    if( attribute.required === true ) return _.includes( ['createInput', 'updateInput', 'type'], purpose );
    if( attribute.required === 'create' ) return _.includes( ['createInput', 'type'], purpose );
    if( attribute.required === 'update' ) return _.includes( ['updateInput'], purpose );
    throw `unallowed required attribute for '${this.entity.name}:{name}'`;
  }

  //
  //
  private skipVirtual(name:string, attribute:TypeAttribute, purpose:AttributePurpose, fieldConfig:any ):boolean {
    if( ! attribute.virtual ) return false;
    if( purpose !== 'type' ) return true;
    if( ! _.isFunction( _.get( this.context.virtualResolver, [this.entity.name, name ] ) ) ){
      fieldConfig.type = GraphQLString;
      console.warn(`no virtual resolver for '${this.entity.name}:${name}'`);
    }
    return false;
  }

  /**
   *
   */
  protected createFilterType():void {
		const name = this.entity.filterName;
		this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
			const fields = { id: { type: GraphQLID } };
			_.forEach( this.attributes(), (attribute, name) => {
        if( attribute.virtual ) return;
        const type = this.getFilterType(attribute);
				if( type ) _.set( fields, name, { type } );
			});
			return fields;
		} });
	}

  /**
   *
   */
	protected addTypeQuery(){
		this.graphx.type( 'query' ).extendFields( () => {
			return _.set( {}, this.entity.singular, {
				type: this.graphx.type(this.entity.typeName),
				args: { id: { type: GraphQLID } },
				resolve: ( root:any, args:any, context:any ) => this.resolveHandler.resolveType( {root, args, context} )
			});
    });
	}

  /**
   *
   */
  protected addTypesQuery(){
		this.graphx.type( 'query' ).extendFields( () => {
			return _.set( {}, this.entity.plural, {
				type: new GraphQLList( this.graphx.type(this.entity.typeName) ),
				args: { filter: { type: this.graphx.type(this.entity.filterName) } },
        resolve: (root:any, args:any, context:any) => this.resolveHandler.resolveTypes( {root, args, context} )
			});
		});
	}

  /**
   *
   */
  protected addSaveMutations():void {
    if( this.entity.isPolymorph ) return;
    const type = new GraphQLObjectType( { name: this.entity.mutationResultName, fields: () => {
      const fields = { validationViolations: {
          type: new GraphQLNonNull( new GraphQLList( this.graphx.type('ValidationViolation')) ) } };
      return _.set( fields, this.entity.singular, {type: this.graphx.type(this.entity.typeName) } );
    }});
    this.addCreateMutation( type );
    this.addUpdateMutation( type );
  }

  /**
   *
   */
  protected addCreateMutation(  type:GraphQLType ):void{
    this.graphx.type( 'mutation' ).extendFields( () => {
      const args = _.set( {}, this.entity.singular, { type: this.graphx.type(this.entity.createInputTypeName)} );
      return _.set( {}, this.entity.createMutationName, {
        type,	args, resolve: (root:any, args:any, context:any ) => this.resolveHandler.createType( {root, args, context} )
      });
    });
  }

  /**
   *
   */
  protected addUpdateMutation(  type:GraphQLType ):void{
    this.graphx.type( 'mutation' ).extendFields( () => {
      const args = _.set( {}, this.entity.singular, { type: this.graphx.type(this.entity.updateInputTypeName)} );
      return _.set( {}, this.entity.updateMutationName, {
        type,	args, resolve: (root:any, args:any, context:any ) => this.resolveHandler.updateType( {root, args, context} )
      });
    });
  }


  /**
   *
   */
	protected addDeleteMutation():void {
		this.graphx.type( 'mutation' ).extendFields( () => {
			return _.set( {}, `delete${this.entity.typeName}`, {
				type: GraphQLBoolean,
				args: { id: { type: GraphQLID } },
				resolve: (root:any, args:any, context:any ) => this.resolveHandler.deleteType( {root, args, context} )
			});
		});
  }

  /**
   *
   */
  private getGraphQLType( attr:TypeAttribute, addNonNull:boolean ):GraphQLType {
    const type = _.isString( attr.graphqlType ) ? this.getTypeForName(attr.graphqlType ) : attr.graphqlType;
    return addNonNull ? new GraphQLNonNull( type ) : type;
  }

    /**
   *
   * @param name
   */
  private getTypeForName( name:string ):GraphQLType {
    let type = typesMap[name];
    if( type ) return type;
    try {
      return this.graphx.type(name);
    } catch (error) {
      console.error(`no such graphqlType - using GraphQLString instead`, name );
    }
    return GraphQLString;
  }


}
