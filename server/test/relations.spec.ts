import _ from 'lodash';

import { Runtime } from '../graph-on-rails/core/runtime';
import { Context } from '../graph-on-rails/core/context';
import { Seeder } from '../graph-on-rails/core/seeder';
import { EntityAccessor } from '../graph-on-rails/entities/entity-accessor';


xdescribe('Relations', () => {

  let context!:Context;
  const accessor = new EntityAccessor();

  beforeAll( async () => {
    const runtime = await Runtime.create( "test:relations", { configFolder: ['./config-types/test']} );
    await runtime.server({});
    await Seeder.create( runtime.context ).seed( true );
    context = runtime.context;

    // logSchema( gor );
  })

  it('should find entities', () => {
    const alpha = context.entities['Alpha'];
    expect( alpha ).toBeDefined();
    const foo = context.entities['Foo'];
    expect( foo ).toBeUndefined();
  })


  it( 'finds items along a assocToChain', async () =>{
    const alpha = context.entities['Alpha'];
    const a1 = _.first( await alpha.findByAttribute( { name: 'a1' } ) );
    const d1 = await accessor.getItemFromAssocToChain( { entity:alpha, item:a1}, "Delta", {} );
    expect( d1.name ).toEqual("d1");
    const a3 = _.first( await alpha.findByAttribute( { name: 'a3' } ) );
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
    const phi1:any = _.first( await phi.findByAttribute( { name: 'phi1' } ) );
    expect( phi1.chiIds ).toHaveLength( 2 );
  })

  it( 'should resolve assocTo', async () => {
    const delta = context.entities['Delta'];
    const d1:any = _.first( await delta.findByAttribute( { name: 'd1' } ) );
    const deltaId = d1.id;
    expect( deltaId ).toBeDefined();
    const alpha = context.entities['Alpha'];
    const d2 = await alpha.resolver.resolveAssocToType( delta, {root: {deltaId}, args:{}, context:{}} );
    expect( d2 ).toEqual( d1 );
  })

  it('shoud resolve assocFrom - advers of assocTo', async ()=> {
    const delta = context.entities['Delta'];
    const d1:any = _.first( await delta.findByAttribute( { name: 'd1' } ) );

    const alpha = context.entities['Alpha'];
    const resolverCtx = { root:{ id: d1.id }, args:{}, context:{} }
    const alphas = await delta.resolver.resolveAssocFromTypes( delta, alpha, resolverCtx);
    expect( alphas ).toHaveLength( 2 );
  })

  it('shoud resolve assocFrom - advers of assocToMany', async ()=> {
    const chi = context.entities['Chi'];
    const chi1:any = _.first( await chi.findByAttribute({name: 'chi1'}));

    const phi = context.entities['Phi'];
    const resolverCtx = { root:{ id: chi1.id }, args:{}, context:{} }
    const phis = await chi.resolver.resolveAssocFromTypes( chi, phi, resolverCtx);
    expect( phis ).toHaveLength( 2 );
  })

})
