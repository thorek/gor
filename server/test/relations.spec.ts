import _ from 'lodash';

import { Gor } from '../graph-on-rails/core/gor';
import { GorContext } from '../graph-on-rails/core/gor-context';
import { Seeder } from '../graph-on-rails/core/seeder';
import { Entity } from '../graph-on-rails/entities/entity';
import { EntityAccessor } from '../graph-on-rails/entities/entity-accessor';

describe('Relations', () => {

  let gor!:Gor;
  let alpha:Entity, beta:Entity, delta:Entity, gamma:Entity;
  const accessor = new EntityAccessor();

  beforeAll( async () => {
    gor = new Gor();

    const context = await GorContext.create("test-relations");
    gor.addConfigs( './config-types/eins', context );
    await gor.server({});
    await Seeder.create(_.values( gor.graphx.entities ) ).seed( true, {} );
    alpha = gor.graphx.entities['Alpha'];
    beta = gor.graphx.entities['Beta'];
    delta = gor.graphx.entities['Delta'];
    gamma = gor.graphx.entities['Gamma'];
  })

  it('should find entities', () => {
    expect( alpha ).toBeDefined();
    const foo = gor.graphx.entities['Foo'];
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

  it( 'finds items along a belongsToChain', async () =>{
    const a1 = _.first( await alpha.resolver.resolveTypes( alpha, {}, { filter: { name: { eq: "a1" } } }, {} ) );
    const d1 = await accessor.getItemFromBelongsToChain( { entity:alpha, item:a1}, "Delta", {} );
    expect( d1.name ).toEqual("d1");
    const a3 = _.first( await alpha.resolver.resolveTypes( alpha, {}, { filter: { name: { eq: "a3" } } }, {} ) );
    const g2 = await accessor.getItemFromBelongsToChain( { entity:alpha, item:a3 }, "Delta.Gamma", {} );
    expect( g2.name ).toEqual("g2");
  });

  it('should find adjective belongsToMany', async ()=> {
    const phi = gor.graphx.entities['Phi'];
    const phi1 = _.first( await phi.resolver.resolveTypes( phi, {}, { filter: { name: { eq: "phi1" } } }, {} ) );
    expect( phi1.chiIds ).toHaveLength( 2 );

    const chi = gor.graphx.entities['Chi'];
    const chi1 = _.first( await phi.resolver.resolveTypes( chi, {}, { filter: { name: { eq: "chi1" } } }, {} ) );
    expect( chi1.phiIds ).toHaveLength( 3 );
    const chi2 = _.first( await phi.resolver.resolveTypes( chi, {}, { filter: { name: { eq: "chi2" } } }, {} ) );
    expect( chi2.phiIds ).toHaveLength( 0 );
  })

})
