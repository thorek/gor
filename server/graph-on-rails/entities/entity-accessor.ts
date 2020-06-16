import _ from 'lodash';

import { EntityModule } from './entity-module';

//
//
export class EntityAccessor extends EntityModule {

  get resolver() { return this.entity.resolver }

  /**
   *
   */
  async findById( id:any, decorate = true ):Promise<any> {
    const item = await this.resolver.findById( this.entity, id );
    return decorate ? await this.decorateItem( item ) : item;
  }

  /**
   *
   */
  async findByIds( ids:any[], decorate = true ):Promise<any> {
    const items = await this.entity.resolver.findByIds( this.entity, ids );
    if( decorate ) for( const item of items ) await this.decorateItem( item );
    return items;
  }

  /**
   *
   */
  async findByAttribute( attrValue:{[name:string]:any}, decorate = true ):Promise<any[]>{
    const items = await this.entity.resolver.findByAttribute( this.entity, attrValue );
    if( decorate ) for( const item of items ) await this.decorateItem( item );
    return items;
  }


  /**
   *
   */
  private async decorateItem( item:any ):Promise<any> {
    await this.resolveVirtualAttributes( item );
    await this.resolveAssocTo( item );
    this.resolveAssocToMany( item );
    this.resolveAssocFrom( item );
    return item;
  }

  /**
   * @param item the item to decorate, this item will be mutated
   * @returns the item
   */
  private async resolveVirtualAttributes( item:any ):Promise<any> {
    for( const name of _.keys(this.entity.attributes) ){
      const attribute = this.entity.attributes[name];
      if( attribute.virtual ) await this.resolveVirtualAttribute( item, name );
    }
    return item;
  }

  /**
   *
   */
  private async resolveVirtualAttribute( item:any, name:string ):Promise<void> {
    let resolver = _.get( this.context.virtualResolver, [this.entity.name, name] );
    if( ! _.isFunction( resolver ) ) resolver = () => {
      return `[no resolver for '${this.entity.name}:${name}' provided]`
    }
    _.set( item, name, resolver);
  }


  /**
   * @param item the item to decorate, this item will be mutated
   * @returns the item
   */
  private async resolveAssocTo( item:any ){
    for( const assocTo of this.entity.assocTo ){
      let foreignEntity = this.context.entities[assocTo.type];
      const fieldName = foreignEntity.singular;
      const foreignKey = _.get( item, foreignEntity.foreignKey);
      if( foreignEntity.isPolymorph ){
        const specificType = _.get( item, foreignEntity.typeField );
        foreignEntity = this.context.entities[specificType];
      }
      Object.defineProperty( item, fieldName, {
        get: async () => { return foreignKey ? foreignEntity.findById( foreignKey ) : undefined }
      });
    }
    return item;
  }

  /**
   * @param item the item to decorate, this item will be mutated
   * @returns the item
   */
  private resolveAssocToMany( item:any ):any {
    for( const assocToMany of this.entity.assocToMany ){
      const foreignEntity = this.context.entities[assocToMany.type];
      const foreignKeys = _.get( item, foreignEntity.foreignKeys);
      Object.defineProperty( item, foreignEntity.plural, {
        get: async () => { return foreignEntity.findByIds( foreignKeys )  }
      });
    }
    return item;
  }


  /**
   * @param item the item to decorate, this item will be mutated
   * @returns the item
   */
  private resolveAssocFrom( item:any ):any {
    for( const assocFrom of this.entity.assocFrom ){
      const foreignEntity = this.context.entities[assocFrom.type];
      Object.defineProperty( item, foreignEntity.plural, {
        get: async () => foreignEntity.findByAttribute( _.set( {}, this.entity.foreignKey , _.toString(item.id) ) )
      });
    }
    return item;
  }

  // /**
  //  *  @returns the assocTo EntityInstance
  //  */
  // async getAssocTo( ei:EntityItem, assocTo:string, context:any ):Promise<EntityItem> {
  //   const entity = ei.entity.context.entities[assocTo];
  //   if( ! entity ) throw new Error(`no such type '${assocTo}'`);
  //   const foreignKey = _.get( ei.item, entity.foreignKey );
  //   if( ! foreignKey ) throw new Error(`no foreignKey for '${assocTo}' in '${ei.entity.typeName}'`);
  //   const item = await entity.findById( foreignKey );
  //   return {entity, item};
  // }

  // /**
  //  *  returns the actual instance from a chain of types with sequential belongTo relations
  //  */
  // async getItemFromAssocToChain( ei:EntityItem, typeNames: string, context: any ):Promise<any> {
  //   const typeChain = _.split( typeNames, '.' );
  //   try {
  //     for( const type of typeChain ){
  //       ei = await this.getAssocTo( ei, type, context );
  //     }
  //     return ei.item;
  //   } catch (error) {
  //     console.error( error );
  //     return null;
  //   }
  // }


}
