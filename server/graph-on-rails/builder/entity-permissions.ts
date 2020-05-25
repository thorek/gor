import _ from 'lodash';
import { AuthenticationError } from 'apollo-server-express';
import { EntityBuilder } from './entity-builder';

export type CrudAction = "read" | "create" | "update" | "delete";

/**
 *
 */
export class EntityPermissions {

  /**
   *
   */
  constructor( protected readonly entity:EntityBuilder ){}

  /**
   * IDEA refactor out into seperate module
   */
  async getPermittedIds( action:CrudAction, context:any ):Promise<boolean|number[]> {
    if( ! this.isUserAndRolesDefined() ) return true;
    if( this.entity.permissions() === null ) return true;
    const roles = this.getUserRoles( context );
    let ids:number[] = [];
    for( const role of roles ){
      const roleIds = await this.getPermittedIdsForRole( role, action, context );
      if( roleIds === true ) return true;
      if( roleIds ) ids = _.concat( ids, roleIds );
    }
    return _.uniq( ids );
  }

  /**
   * @returns true if all items can be accessed, false when none, or the array of ObjectIDs that accessible items must match
   */
  protected async getPermittedIdsForRole( role:string, action:CrudAction, context:any ):Promise<boolean|number[]> {
    let permissions = this.getActionPermissionsForRole( role, action );
    if( _.isBoolean( permissions ) ) return permissions;
    if( _.isString( permissions ) ) return this.getPermittedIdsForRole( permissions, action, context );
    let ids:number[][] = [];
    for( const permission of permissions as (string|object)[] ){
      const actionIds = await this.getIdsForActionPermission( role, permission, context );
      if( _.isBoolean( actionIds) ) {
        if( actionIds === false ) return false;
      } else ids.push( actionIds );
    }
    return _.intersection( ...ids );
  }

  /**
   *  @param permission if this is a string it will be handled as a reference to an action for the role
   *  in this or a belongsTo entity. If it is an object it is delegated to the resolver to use to return the
   *  permitted ids
   */
  protected async getIdsForActionPermission( role:string, permission:string|object, context:any ):Promise<boolean|number[]> {
    if( _.isString( permission ) ) return this.getIdsForReference( role, permission, context );
    return this.entity.resolver.getPermittedIds( this.entity, permission, context );
  }

  /**
   *
   */
  protected async getIdsForReference( role:string, permissionReference:string, context:any ):Promise<boolean|number[]> {
    const entityAction = _.split( permissionReference, '.' );
    const action = _.last( entityAction );
    const entity = _.size( entityAction ) === 1 ? this.entity : this.getBelongsToEntity( _.first( entityAction ) );
    if( entity ) entity.entityPermissions.getPermittedIdsForRole( role, action as CrudAction, context );
    return false;
  }

  /**
   *
   */
  protected getBelongsToEntity( entity:undefined|string ):null|EntityBuilder {
    const entityIsBelongsTo = _.find( this.entity.belongsTo(), refEntity => refEntity.type === entity );
    if( entityIsBelongsTo ) return this.entity.graphx.entities[ entity as string ];
    console.warn(`'${entity}' is not a belongsTo of '${this.entity.name}'`);
    return null;
  }

  /**
   *  everything defined for a role, can depend on the action or can be defined for all actions
   *
   *  @param role a role of the user
   *  @param action either create, read, update, delete
   *  @returns
   *    boolean - all allowed / unallowed
   *
   *    string - another role in this permissions to get the permitted ids
   *
   *    (string|object)[] - string - get permissions from action in this or a belongsTo entity for the same role
   *                      - object - create filter for query as described below
   *
   *  ### Filter for query:
   *  ```
   *    attributeA: value
   *  ```
   *  becomes `{ attributeA: { $eq: value } }`
   *
   *  ---
   *
   *  ```
   *    attributeB:
   *      - value1
   *      - value2
   *      - value3
   *  ```
   *  becomes `{ attributeB: { $in [value1, value2, value3] } }`
   *
   *
   *  ### Examples
   *  ```
   *  entity:
   *    Contract:
   *      attributes:
   *        name: string
   *        status: string
   *      belongsTo:
   *        - Car
   *      permissions:
   *        admin: true                 # all actions, everything permitted
   *        guest: false                # all actions, nothing permitted
   *        user: admin                 # all actions the same as for role 'admin'
   *        roleA:
   *          all: true                 # all actions, everything permitted, same as roleA: true
   *        roleB:
   *          all: false                # all actions, nothing permitted - same as roleB: false, pointless
   *          read: true                # except reading is allowed
   *        roleC:
   *          read: true                # reading of all items allowed
   *          create: read              # same as read
   *          update: read              # same as read
   *          delete: false             # no items allowed to delete
   *        roleD:
   *          all:
   *            name: 'Example'
   *          delete: roleC
   *        roleE:
   *          all:
   *            - name: 'Example'
   *        roleF:
   *          read:
   *            - name: 'Example'
   *              status: 'open'
   *          all:
   *            - read
   *            - status:
   *              - draft
   *              - open
   *              name: user.assignedContracts  # will be resolved with context
   *        roleG:
   *          all:
   *            name:
   *              - Example1
   *              - Example2
   *            status:
   *              - open
   *              - draft
   *        roleH:
   *          all: Car.read             # same as in Car.permissions.roleD.read (Car must be a belongsTo)
   *                                    # permisions in Car could also delegate to another belongsTo entity
   *        roleI:
   *          create: false
   *          all:
   *            name: 'Example'         # read, update, delete allowed for all items with { name: { $eq: "Example" } }
   *        roleJ:
   *          all:
   *            - Car.read               # all actions same as defined in Car.read
   *            - name: 'Example'        # and all items with { name: { $eq: "Example" } }
   *        roleK:
   *          all:
   *            - filter: '{ $and: { name: { $eq: "foo", $neq: "bar" }, { status: { $in officialStatus }} }}'
   * ```
   *
   */
  private getActionPermissionsForRole(role:string, action:CrudAction):boolean | string | (string|object)[]  {
    const permissions = _.get( this.entity.permissions(), role );
    if( _.isBoolean( permissions ) || _.isString( permissions ) ) return permissions;
    let actionPermission = _.get( permissions, action );
    if( ! actionPermission ) actionPermission = _.get( permissions, "all" );
    if( ! actionPermission ) return false;
    if( _.isArray( actionPermission ) ) return actionPermission;
    if( _.isObject( actionPermission ) || _.isString( actionPermission) ) return [actionPermission];
    console.warn(`unexpected permission for role '${role}', action '${action}'`, actionPermission );
    return false;
  }

  /**
   *
   */
  protected isUserAndRolesDefined():boolean {
    return this.entity.gorConfig.contextUser != null && this.entity.gorConfig.contextRoles != null;
  }

  /**
   *
   */
  protected getUserRoles( context:any ):string[] {
    const user = _.get( context, this.entity.gorConfig.contextUser as string );
    if( ! user ) throw "should not happen, no user in context";
    let roles:any = _.get( user, this.entity.gorConfig.contextRoles as string );
    if( ! roles ) throw new AuthenticationError( `User has no role - ${JSON.stringify( user ) }` );
    return _.isArray( roles ) ? roles : [roles];
  }

}
