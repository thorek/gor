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

  it( 'finds items along a assocToChain', async () =>{
    const a1 = _.first( await alpha.resolver.resolveTypes( alpha, {}, { filter: { name: { eq: "a1" } } }, {} ) );
    const d1 = await accessor.getItemFromAssocToChain( { entity:alpha, item:a1}, "Delta", {} );
    expect( d1.name ).toEqual("d1");
    const a3 = _.first( await alpha.resolver.resolveTypes( alpha, {}, { filter: { name: { eq: "a3" } } }, {} ) );
    const g2 = await accessor.getItemFromAssocToChain( { entity:alpha, item:a3 }, "Delta.Gamma", {} );
    expect( g2.name ).toEqual("g2");
  })

  it('should recognice assocToMany', async () => {
    const phi = gor.graphx.entities['Phi'];
    const expected = { type: 'Chi' }
    expect( _.first(phi.assocToMany) ).toEqual( expected );
  })

  it('should find assocToMany', async ()=> {
    const phi = gor.graphx.entities['Phi'];
    const phi1 = _.first( await phi.resolver.resolveTypes( phi, {}, { filter: { name: { eq: "phi1" } } }, {} ) );
    expect( phi1.chiIds ).toHaveLength( 2 );
  })

  it( 'should resolve assocTo', async () => {
    const delta = gor.graphx.entities['Delta'];
    const d1 = _.first( await delta.resolver.resolveTypes( delta, {}, { filter: { name: { eq: "d1" } } }, {} ) );
    const deltaId = d1.id;
    expect( deltaId ).toBeDefined();
    const alpha = gor.graphx.entities['Alpha'];
    const d2 = await alpha.resolver.resolveAssocToType( delta, {deltaId}, {}, {} );
    expect( d2 ).toEqual( d1 );
  })

  it('shoud resolve assocFrom - advers of assocTo', async ()=> {
    const delta = gor.graphx.entities['Delta'];
    const d1 = _.first( await delta.resolver.resolveTypes( delta, {}, { filter: { name: { eq: "d1" } } }, {} ) );

    const alpha = gor.graphx.entities['Alpha'];
    const alphas = await delta.resolver.resolveAssocFromTypes( delta, alpha, { id: d1.id }, {}, {} );
    expect( alphas ).toHaveLength( 2 );
  })

  it('shoud resolve assocFrom - advers of assocToMany', async ()=> {
    const chi = gor.graphx.entities['Chi'];
    const chi1 = _.first( await delta.resolver.resolveTypes( chi, {}, { filter: { name: { eq: "chi1" } } }, {} ) );

    const phi = gor.graphx.entities['Phi'];
    const phis = await chi.resolver.resolveAssocFromTypes( chi, phi, { id: chi1.id }, {}, {} );
    expect( phis ).toHaveLength( 2 );
  })

})
