import _ from 'lodash';
import { EntityBuilder } from "./entity-builder";

export type EntityInstance = {
  entity:EntityBuilder
  instance:any
}

export class EntityAccessor {

  /**
   *  @returns the belongsTo EntityInstance
   */
  async getBelongsTo( ei:EntityInstance, belongsTo:string, context:any ):Promise<EntityInstance> {
    const entity = ei.entity.graphx.entities[belongsTo];
    if( ! entity ) throw new Error(`no such type '${belongsTo}'`);
    const foreignKey = _.get( ei.instance, entity.foreignKey() );
    if( ! foreignKey ) throw new Error(`no foreignKey for '${belongsTo}' in '${ei.entity.name()}'`);
    const args = _.set({}, 'id', foreignKey );
    const instance = await ei.entity.resolver.resolveType( entity, {}, args, context );
    return {entity, instance};
  }

  /**
   *  returns the actual instance from a chain of types with sequential belongTo relations
   */
  async getInstanceFromBelongsToChain( ei:EntityInstance, typeNames: string, context: any ):Promise<any> {
    const typeChain = _.split( typeNames, '.' );
    try {
      for( const type of typeChain ){
        ei = await this.getBelongsTo( ei, type, context );
      }
      return ei.instance;
    } catch (error) {
      console.error( error );
      return null;
    }
  }


}
