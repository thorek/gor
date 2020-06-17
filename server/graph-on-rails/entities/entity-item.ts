import _ from 'lodash';
import { Entity } from "./entity";

//
//
export class EntityItem {

  get context() { return this.entity.context }

  constructor( public readonly entity:Entity, public readonly item:any ){}

  static async create( entity:Entity, item:any ):Promise<EntityItem>{
    const entityItem = new EntityItem( entity, item );
    await entityItem.defineVirtualAttributes();
    return entityItem;
  }

  /**
   *
   * @param name
   */
  async assocTo( name:string ):Promise<EntityItem|undefined> {
    const assocTo = _.find( this.entity.assocTo, assocTo => assocTo.type === name );
    if( ! assocTo ) return this.warn( `no such assocTo '${name}'`, undefined );
    let foreignEntity = this.context.entities[assocTo.type];
    if( ! foreignEntity ) return this.warn( `assocTo '${name}' is no entity`, undefined );
    const foreignKey = _.get( this.item, foreignEntity.foreignKey);
    if( foreignEntity.isPolymorph ){
      const specificType = _.get( this.item, foreignEntity.typeField );
      foreignEntity = this.context.entities[specificType];
      if( ! foreignEntity ) return undefined;
    }
    return foreignKey ? foreignEntity.findById( foreignKey ) : undefined;
  }

  /**
   * @param name
   */
  async assocToMany( name:string ):Promise<EntityItem[]> {
    const assocToMany = _.find( this.entity.assocToMany, assocToMany => assocToMany.type === name );
    if( ! assocToMany ) return this.warn(`no such assocToMany '${name}'`, []);
    const foreignEntity = this.context.entities[assocToMany.type];
    if( ! foreignEntity ) return this.warn( `assocToMany '${name}' is no entity`, [] );
    const foreignKeys = _.get( this.item, foreignEntity.foreignKeys);
    return foreignEntity.findByIds( foreignKeys );
  }

  /**
   * @param name
   */
  async assocFrom( name:string ):Promise<EntityItem[]>{
    const assocFrom = _.find( this.entity.assocFrom, assocFrom => assocFrom.type === name );
    if( ! assocFrom ) return this.warn(`no such assocFrom '${name}'`, []);
    const foreignEntity = this.context.entities[assocFrom.type];
    if( ! foreignEntity ) return this.warn( `assocFrom '${name}' is no entity`, [] );
    const entites = foreignEntity.isPolymorph ? foreignEntity.entities : [this.entity];
    const items:EntityItem[] = [];
    for( const entity of entites ){
      const attr = _.set({}, this.entity.foreignKey, _.toString( this.item.id ) );
      items.push( ... await entity.findByAttribute( attr ) );
    }
    return items;
  }

  /**
   *
   */
  async save():Promise<EntityItem>{
    const allowed = _.concat(
      _.keys( this.entity.attributes ),
      _.flatten( _.map( this.entity.assocTo, assocTo => this.context.entities[assocTo.type].foreignKey ) ),
      _.flatten( _.map( this.entity.assocToMany, assocTo => this.context.entities[assocTo.type].foreignKeys ) ),
      _.flatten( _.map( this.entity.implements, impl => _.keys( impl.attributes ) ) )
    );
    const attrs = _.pick( this.item, allowed );
    const item = attrs.id ?
      await this.entity.resolver.updateType( this.entity, attrs ) :
      await this.entity.resolver.createType( this.entity, attrs );
    return EntityItem.create( this.entity, item );
  }

  //
  //
  private async defineVirtualAttributes(){
    for( const name of _.keys( this.entity.attributes ) ){
      const attribute = this.entity.attributes[name];
      if( attribute.virtual ) await this.resolveVirtualAttribute( name );
    }
  }

  //
  //
  private async resolveVirtualAttribute( name:string ):Promise<void> {
    let resolver = _.get( this.context.virtualResolver, [this.entity.name, name] );
    if( ! _.isFunction( resolver ) ) resolver = ({}) => {
      return `[no resolver for '${this.entity.name}:${name}' provided]`
    }
    const value = await Promise.resolve( resolver(this.item) );
    Object.defineProperty( this.item, name, { value } )
  }

  //
  //
  private warn<T>( msg:string, returnValue:T ):T{
    console.warn( `EntitItem '${this.entity.name}': ${msg}`);
    return returnValue;
  }

}
