import _ from 'lodash';

import { Entity } from './entity';

export type EntityItem = {
  entity:Entity
  item:any
}

export class EntityAccessor {

  /**
   *  @returns the assocTo EntityInstance
   */
  async getAssocTo( ei:EntityItem, assocTo:string, context:any ):Promise<EntityItem> {
    const entity = ei.entity.context.entities[assocTo];
    if( ! entity ) throw new Error(`no such type '${assocTo}'`);
    const foreignKey = _.get( ei.item, entity.foreignKey );
    if( ! foreignKey ) throw new Error(`no foreignKey for '${assocTo}' in '${ei.entity.typeName}'`);
    const args = _.set({}, 'id', foreignKey );
    const item = await ei.entity.resolver.resolveType( entity, {}, args, context );
    return {entity, item};
  }

  /**
   *  returns the actual instance from a chain of types with sequential belongTo relations
   */
  async getItemFromAssocToChain( ei:EntityItem, typeNames: string, context: any ):Promise<any> {
    const typeChain = _.split( typeNames, '.' );
    try {
      for( const type of typeChain ){
        ei = await this.getAssocTo( ei, type, context );
      }
      return ei.item;
    } catch (error) {
      console.error( error );
      return null;
    }
  }


}
