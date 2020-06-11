import { GorContext } from 'graph-on-rails/core/gor-context';
import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLUnionType, GraphQLString, GraphQLEnumType, GraphQLInterfaceType, GraphQLType } from 'graphql';
import _ from 'lodash';

import { Entity, EntityReference } from '../entities/entity';
import { TypeAttribute } from '../entities/type-attribute';
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
	protected createObjectType():void {
    if( this.entity.isUnion ) return;
    const from = this.entity.isInterface ? GraphQLInterfaceType : GraphQLObjectType;
    const name = this.entity.typeName;
		this.graphx.type( name, {
      from, name,
      fields: () => {
			  const fields = { id: { type: new GraphQLNonNull(GraphQLID) } };
			  return _.merge( fields, this.getAttributeFields( true ) );
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
    this.graphx.type(this.entity.typeName).extendFields( () => this.getAttributeFields( true, entity ) );
    this.graphx.type(this.entity.filterName).extendFields( () => this.getAttributeFields( false, entity ) );
    this.graphx.type(this.entity.createInputTypeName).extendFields( () => this.getAttributeFields( true, entity ) );
    this.graphx.type(this.entity.updateInputTypeName).extendFields( () => this.getAttributeFields( false, entity ) );
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
  protected createCreateInputType():void {
		const name = this.entity.createInputTypeName;
		this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => this.getAttributeFields( true ) });
	}

  /**
   *
   */
  protected createUpdateInputType():void {
		const name = this.entity.updateInputTypeName;
		this.graphx.type( name, { name, from: GraphQLInputObjectType, fields: () => {
			const fields = { id: { type: new GraphQLNonNull(GraphQLID) }};
			return _.merge( fields, this.getAttributeFields( false ) );
		}});
	}

  /**
   *
   * @param fields
   */
  protected getAttributeFields( addRequired:boolean, entity?:Entity,  ):any {
    const attributes = entity ? entity.attributes : this.attributes();
    const fields = {};
		_.forEach( attributes, (attribute, name) => {
      _.set( fields, name, {
        type: this.context.getGraphQLType(attribute, addRequired),
        description: attribute.description } );
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
			_.forEach( this.attributes(), (attribute, name) => {
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
				resolve: (root:any, args:any, context:any) => this.resolver.resolveType( this.entity, root, args, context )
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
        resolve: (root:any, args:any, context:any) => this.resolver.resolveTypes( this.entity, root, args, context )
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
    this.addSaveMutation( this.entity.createMutationName, this.entity.createInputTypeName, type );
    this.addSaveMutation( this.entity.updateMutationName, this.entity.updateInputTypeName, type );
  }

  /**
   *
   */
  protected addSaveMutation( mutationName:string, inputType:string, type:GraphQLType ):void{
    this.graphx.type( 'mutation' ).extendFields( () => {
      const args = _.set( {}, this.entity.singular, { type: this.graphx.type(inputType)} );
      return _.set( {}, mutationName, {
        type,	args, resolve: (root:any, args:any, context:any ) => this.saveEntity( root, args, context )
      });
    });
  }


  /**
   *
   */
  private async saveEntity( root: any, args: any, context:any ) {
    let validationViolations = await this.entity.validate( root, args, context );
    if( _.size( validationViolations ) ) return { validationViolations };
    return _.set( {validationViolations: []}, this.entity.singular, this.resolver.saveEntity( this.entity, root, args, context ) );
  }

  /**
   *
   */
	protected addDeleteMutation():void {
		this.graphx.type( 'mutation' ).extendFields( () => {
			return _.set( {}, `delete${this.entity.typeName}`, {
				type: GraphQLBoolean,
				args: { id: { type: GraphQLID } },
				resolve: (root:any, args:any, context:any ) => this.resolver.deleteEntity( this.entity, root, args, context )
			});
		});
  }

}
