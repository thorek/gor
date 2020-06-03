import _ from 'lodash';
import { Entity } from './entity';

export type EntityItem = {
  entity:Entity
  item:any
}

export class EntityAccessor {

  /**
   *  @returns the belongsTo EntityInstance
   */
  async getBelongsTo( ei:EntityItem, belongsTo:string, context:any ):Promise<EntityItem> {
    const entity = ei.entity.graphx.entities[belongsTo];
    if( ! entity ) throw new Error(`no such type '${belongsTo}'`);
    const foreignKey = _.get( ei.item, entity.foreignKey );
    if( ! foreignKey ) throw new Error(`no foreignKey for '${belongsTo}' in '${ei.entity.typeName}'`);
    const args = _.set({}, 'id', foreignKey );
    const item = await ei.entity.resolver.resolveType( entity, {}, args, context );
    return {entity, item};
  }

  /**
   *  returns the actual instance from a chain of types with sequential belongTo relations
   */
  async getItemFromBelongsToChain( ei:EntityItem, typeNames: string, context: any ):Promise<any> {
    const typeChain = _.split( typeNames, '.' );
    try {
      for( const type of typeChain ){
        ei = await this.getBelongsTo( ei, type, context );
      }
      return ei.item;
    } catch (error) {
      console.error( error );
      return null;
    }
  }


}
