export class EntityRelations {
  // /**
  //  *
  //  */
  // protected addLockRelations():void {
  //   _.forEach( this.entity.equality, (types, typeToEnsure) => {
  //     _.forEach( types, entityName => {
  //       const entity = this.graphx.entities[entityName];
  //       if( ! entity ) return console.warn(`addSameRelation no such entity '${entityName}'`);
  //       entity.lockRelation.push( _.set( {}, typeToEnsure, [this.entity.typeName, ..._.without(types, entityName)]));
  //     });
  //   });
  // }

  // /**
  //  *
  //  */
  // protected async validateRelations(root: any, args: any, context:any  ):Promise<string[]> {
  //   const input = _.get( args, this.entity.singular );
  //   context.relatedEntities = {} as {[typeName:string]:any};  // to simple, wouldnt handle multiple relations to same type
  //   let errors:string[] = await this.validateExistingBelongsTo( input, context );
  //   if( _.size( errors ) ) return errors;
  //   errors.push( ...this.validateEqualities( input, context ) );
  //   errors.push( ...(await this.validateLockRelations( input, context )) );
  //   return errors;
  // }

  // /**
  //  *  checks if all belongsTo foreignKeys in the input refer to an existing id of the belongsTo type
  //  */
  // private async validateExistingBelongsTo( input:any, context:any ):Promise<string[]>{
  //   const errors:string[] = [];
  //   for( const key of _.keys( input ) ){
  //     const entity = _.find( this.graphx.entities, entity => entity.entity.foreignKey === key );
  //     if( ! entity ) continue;
  //     const value = _.get(input, key);
  //     const item = await this.resolver.resolveType( entity, {}, {id: value}, context );
  //     if( item ) {
  //       context.relatedEntities[entity.entity.typeName] = item;
  //     } else errors.push(`${key} - no item of '${entity.entity.typeName}' with id '${value}' does exist.`);
  //   }
  //   return errors;
  // }

  // /**
  //  * checks the equality conditions
  //  */
  // private validateEqualities( input:any, context:any ):string[] {

  //   return _.compact( _.map( this.entity.equality, (types, attribute) => {
  //     const entity = this.graphx.entities[attribute];
  //     return this.validateEqualValues( input, entity || attribute, types, context );
  //   }));
  // }

  // /**
  //  *
  //  */
  // private validateEqualValues( input:any, entityOrAttribute:EntityBuilder|string, types:string[], context:any ):string|undefined{
  //   const attribute = _.isString( entityOrAttribute ) ? entityOrAttribute : entityOrAttribute.entity.foreignKey;
  //   const values = _.uniq( _.map( types, typeChain => {
  //     const item = this.accessor.getInstanceFromBelongsToChain( {entity: this, instance: input }, typeChain, context );
  //     if( ! item ) return console.warn(`validate Relation could not resolve type '${typeChain}'`);
  //     return _.get( item, attribute );
  //   }));
  //   if( _.size(values ) === 1 ) return undefined;
  //   return `[${_.join( types, ', ')}] should have equal values for '${attribute}' but it is [${values}]`;
  // }



  // /**
  //  *
  //  */
  // private async validateLockRelations( input:any, context:any ):Promise<string[]> {
  //   // _.forEach( this.lockRelation, (types, typeToLock) => {
  //   //   const entity = this.graphx.entities[typeToLock];
  //   //   if( ! entity ) return console.error(`validateLockRelations - no such entity '${typeToLock}'`);
  //   //   const foreignKey = _.get( input, entity.foreignKey() );
  //   //   _.forEach( types, typeToCheck => {

  //   //   });
  //   // });
  //   return [];
  // }

}
