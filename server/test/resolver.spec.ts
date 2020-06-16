import _ from 'lodash';

import { Context } from '../graph-on-rails/core/context';
import { Runtime } from '../graph-on-rails/core/runtime';
import { Seeder } from '../graph-on-rails/core/seeder';


describe('Resolver', () => {

  let context!:Context;

  beforeAll( async () => {
    const runtime = await Runtime.create( "test:resolver", { domainConfiguration: {
      entity: {
        Alpha: {
          attributes: {
            name: "key",
            number: "int"
          },
          seeds: {
            a1: { name: 'a1', number: 1 },
            a2: { name: 'a2', number: 2 },
            a3: { name: 'a3', number: 3 },
            a4: { name: 'a4' }
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

  it('should find items by string filter', async () => {
    const resolverCtx = { root:{}, args:{}, context:{} };
    const alpha = context.entities['Alpha'];
    const a1 = await alpha.resolver.resolveTypes( alpha, _.set( resolverCtx, 'args', { filter: { name: { is: "a1" } } } ) );
    expect( a1 ).toHaveLength(1);
    const arr = await alpha.resolver.resolveTypes( alpha, _.set( resolverCtx, 'args', { filter: { name: { contains: "a" } } } ) );
    expect( arr ).toHaveLength(4);
    const aX = await alpha.resolver.resolveTypes( alpha, _.set( resolverCtx, 'args', { filter: { name: { is: "aX" } } } ) );
    expect( aX ).toHaveLength(0);
  })

  it('should find items by int filter', async () => {
    const resolverCtx = { root:{}, args:{}, context:{} };
    const alpha = context.entities['Alpha'];

    const aLt2 = await alpha.resolver.resolveTypes( alpha, _.set( resolverCtx, 'args', { filter: { number: { lt: 2 } } } ) );
    expect( aLt2 ).toHaveLength(1);

    const aGt1 = await alpha.resolver.resolveTypes( alpha, _.set( resolverCtx, 'args', { filter: { number: { gt: 1 } } } ) );
    expect( aGt1 ).toHaveLength(2);

    const aBetween2_4 = await alpha.resolver.resolveTypes( alpha, _.set( resolverCtx, 'args', { filter: { number: { between: [2,4] } } } ) );
    expect( aBetween2_4 ).toHaveLength(2);
  })


})
