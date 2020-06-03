import _ from 'lodash';
import { Gor, GorConfig } from "../graph-on-rails/core/gor";
import { EntityBuilder } from "../graph-on-rails/builder/entity-builder";
import { MongoDbResolver } from "../graph-on-rails-mongodb/mongodb.resolver";
import { ValidateJs } from "../graph-on-rails/validation/validate-js";
import { EntityPermissions } from "../graph-on-rails/builder/entity-permissions";
import { Seeder } from "../graph-on-rails/core/seeder";

describe('Relations', () => {

  let gor:Gor|null = null;
  let alpha:EntityBuilder, beta:EntityBuilder, delta:EntityBuilder, gamma:EntityBuilder;

  beforeAll( async () => {
    gor = new Gor();
    const resolver = await MongoDbResolver.create( { url: 'mongodb://localhost:27017', dbName: 'd2prom' } );
    const config:GorConfig = {
      resolver: () => resolver,
      validator: (entity:EntityBuilder) => new ValidateJs( entity ),
      entityPermissions: (entity:EntityBuilder) => new EntityPermissions( entity ),
      contextUser: "user",
      contextRoles: "roles"
    };
    gor.addConfigs( './config-types/eins', config );
    await gor.server({});
    await Seeder.create(_.values( gor.graphx.entities ) ).seed( true, {} );
    alpha = gor.graphx.entities['Alpha'];
    beta = gor.graphx.entities['Beta'];
    delta = gor.graphx.entities['Delta'];
    gamma = gor.graphx.entities['Gamma'];
  })

  it('should find entities', () => {
    expect( alpha ).toBeDefined();
    const foo = gor?.graphx.entities['Foo'];
    expect( foo ).toBeUndefined();
  })

  it('should find items', async () => {
    const a1 = await alpha.resolver.resolveTypes( alpha, {}, { filter: { name: { eq: "a1" } } }, {} );
    expect( a1 ).toHaveLength(1);
    const arr = await alpha.resolver.resolveTypes( alpha, {}, { filter: { name: { contains: "a" } } }, {} );
    expect( arr ).toHaveLength(3);
    const aX = await alpha.resolver.resolveTypes( alpha, {}, { filter:  {name: { eq: "aX" } } }, {} );
    expect( aX ).toHaveLength(0);
  })

})
