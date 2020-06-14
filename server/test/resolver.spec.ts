import _ from 'lodash';

import { Context } from '../graph-on-rails/core/context';
import { Runtime } from '../graph-on-rails/core/runtime';
import { Seeder } from '../graph-on-rails/core/seeder';


xdescribe('Relations', () => {

  let context!:Context;

  beforeAll( async () => {
    const runtime = await Runtime.create( "test:resolver", { domainConfiguration: {
      entity: {
        Alpha: {
          attributes: { name: "string" },
          seeds: {
            a1: { name: 'a1' },
            a2: { name: 'a2' },
            a3: { name: 'a3' }
          }
        }
      }
    }});
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

  it('should find items', async () => {
    const resolverCtx = { root:{}, args:{}, context:{} };
    const alpha = context.entities['Alpha'];
    const a1 = await alpha.resolver.resolveTypes( alpha, _.set( resolverCtx, 'args', { filter: { name: { is: "a1" } } } ) );
    expect( a1 ).toHaveLength(1);
    const arr = await alpha.resolver.resolveTypes( alpha, _.set( resolverCtx, 'args', { filter: { name: { contains: "a" } } } ) );
    expect( arr ).toHaveLength(3);
    const aX = await alpha.resolver.resolveTypes( alpha, _.set( resolverCtx, 'args', { filter: { name: { is: "aX" } } } ) );
    expect( aX ).toHaveLength(0);
  })


})
