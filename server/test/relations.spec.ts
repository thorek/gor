import _ from 'lodash';

import { Gor } from '../graph-on-rails/core/gor';
import { GorContext } from '../graph-on-rails/core/gor-context';
import { Seeder } from '../graph-on-rails/core/seeder';
import { EntityAccessor } from '../graph-on-rails/entities/entity-accessor';


describe('Relations', () => {

  let context!:GorContext;
  const accessor = new EntityAccessor();

  beforeAll( async () => {
    const gor = await Gor.create( "tests" );
    gor.addConfigFolder( './config-types/test' );
    await gor.server({});
    await Seeder.create( gor.context ).seed( true, {} );
    context = gor.context;

    // logSchema( gor );
  })

  it('should find entities', () => {
    const alpha = context.entities['Alpha'];
    expect( alpha ).toBeDefined();
    const foo = context.entities['Foo'];
    expect( foo ).toBeUndefined();
  })

  it('should find items', async () => {
    const alpha = context.entities['Alpha'];
    const a1 = await alpha.resolver.resolveTypes( alpha, {}, { filter: { name: { eq: "a1" } } }, {} );
    expect( a1 ).toHaveLength(1);
    const arr = await alpha.resolver.resolveTypes( alpha, {}, { filter: { name: { contains: "a" } } }, {} );
    expect( arr ).toHaveLength(3);
    const aX = await alpha.resolver.resolveTypes( alpha, {}, { filter:  {name: { eq: "aX" } } }, {} );
    expect( aX ).toHaveLength(0);
  })

  it( 'finds items along a assocToChain', async () =>{
    const alpha = context.entities['Alpha'];
    const a1 = _.first( await alpha.resolver.resolveTypes( alpha, {}, { filter: { name: { eq: "a1" } } }, {} ) );
    const d1 = await accessor.getItemFromAssocToChain( { entity:alpha, item:a1}, "Delta", {} );
    expect( d1.name ).toEqual("d1");
    const a3 = _.first( await alpha.resolver.resolveTypes( alpha, {}, { filter: { name: { eq: "a3" } } }, {} ) );
    const g2 = await accessor.getItemFromAssocToChain( { entity:alpha, item:a3 }, "Delta.Gamma", {} );
    expect( g2.name ).toEqual("g2");
  })

  it('should recognice assocToMany', async () => {
    const phi = context.entities['Phi'];
    const expected = { type: 'Chi' }
    expect( _.first(phi.assocToMany) ).toEqual( expected );
  })

  it('should find assocToMany', async ()=> {
    const phi = context.entities['Phi'];
    const phi1 = _.first( await phi.resolver.resolveTypes( phi, {}, { filter: { name: { eq: "phi1" } } }, {} ) );
    expect( phi1.chiIds ).toHaveLength( 2 );
  })

  it( 'should resolve assocTo', async () => {
    const delta = context.entities['Delta'];
    const d1 = _.first( await delta.resolver.resolveTypes( delta, {}, { filter: { name: { eq: "d1" } } }, {} ) );
    const deltaId = d1.id;
    expect( deltaId ).toBeDefined();
    const alpha = context.entities['Alpha'];
    const d2 = await alpha.resolver.resolveAssocToType( delta, {deltaId}, {}, {} );
    expect( d2 ).toEqual( d1 );
  })

  it('shoud resolve assocFrom - advers of assocTo', async ()=> {
    const delta = context.entities['Delta'];
    const d1 = _.first( await delta.resolver.resolveTypes( delta, {}, { filter: { name: { eq: "d1" } } }, {} ) );

    const alpha = context.entities['Alpha'];
    const alphas = await delta.resolver.resolveAssocFromTypes( delta, alpha, { id: d1.id }, {}, {} );
    expect( alphas ).toHaveLength( 2 );
  })

  it('shoud resolve assocFrom - advers of assocToMany', async ()=> {
    const chi = context.entities['Chi'];
    const chi1 = _.first( await chi.resolver.resolveTypes( chi, {}, { filter: { name: { eq: "chi1" } } }, {} ) );

    const phi = context.entities['Phi'];
    const phis = await chi.resolver.resolveAssocFromTypes( chi, phi, { id: chi1.id }, {}, {} );
    expect( phis ).toHaveLength( 2 );
  })

})
