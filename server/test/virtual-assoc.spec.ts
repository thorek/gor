import { printSchema } from 'graphql';
import _ from 'lodash';

import { Runtime } from '../graph-on-rails/core/runtime';
import { Seeder } from '../graph-on-rails/core/seeder';
import { Context } from '../graph-on-rails/core/context';

describe('Associations', () => {

  let runtime!:Runtime;
  let context:Context;

  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeAll( async () => {
    runtime = await Runtime.create( "test:virtual-assoc", {
      domainConfiguration: {
        entity: {
          Alpha: {
            attributes: {
              name: 'key',
            },
            assocTo: 'Beta',
            seeds: {
              "alpha1": { name: "alpha1", Beta: 'beta1' },
              "alpha2": { name: "alpha2", Beta: 'beta1' },
              "alpha3": { name: "alpha3", Beta: 'beta2' },
              "alpha4": { name: "alpha4" }
            }
          },
          Beta: {
            attributes: {
              name: 'key'
            },
            assocFrom: 'Alpha',
            seeds: {
              "beta1": { name: "beta1" },
              "beta2": { name: "beta2" },
              "beta3": { name: "beta3" }
            }
          },
          Delta: {
            attributes: {
              name: 'key'
            },
            assocToMany: 'Alpha',
            seeds: {
              delta1: {
                name: 'delta1',
                Alpha: ["alpha1", "alpha2", "alpha4" ]
              },
              delta2: {
                name: 'delta2',
                Alpha: ["alpha3", "alpha4" ]
              },
              delta3: {
                name: 'delta3'
              }
            }
          }
        }
      }
    });
    await runtime.server();
    await Seeder.create( runtime.context ).seed( true );
    context = runtime.context;
  })

  //
  //
  it('should follow assocTo', async ()=> {
    const alpha = context.entities['Alpha'];
    const beta = context.entities['Beta'];

    const alpha1 = await alpha.findOneByAttribute( {name: 'alpha1'} );
    const beta1 = await beta.findOneByAttribute( {name: 'beta1'} );
    console.log( "alpha1?.item", alpha1?.item );
    expect( alpha1?.item ).toMatchObject({name: 'alpha1', betaId: beta1?.id })
    expect( await alpha1?.assocTo('beta') ).toEqual( beta1 );
    const alpha2 = await alpha.findOneByAttribute( {name: 'alpha2'} );
    expect( await alpha2?.assocTo('beta') ).toEqual( await alpha1?.assocTo('beta') );
    const alpha4 = await alpha.findOneByAttribute( {name: 'alpha4'} );
    expect( await alpha4?.assocTo('beta') ).toBeUndefined();
  })

  //
  //
  it('should follow assocFrom', async ()=> {
    const beta = context.entities['Beta'];
    const beta1 = await beta.findOneByAttribute( {name: 'beta1'} );
    const alphas1 = await beta1?.assocFrom('alphas');
    expect( alphas1 ).toHaveLength( 2 );
    expect( alphas1 ).toEqual( expect.arrayContaining([
      expect.objectContaining( { name: 'alpha1' }),
      expect.objectContaining( { name: 'alpha2' })
    ]));
    const beta3 = await beta.findOneByAttribute( {name: 'beta3'} );
    const alphas3 = await beta3?.assocFrom('alphas');
    expect( alphas3 ).toHaveLength( 0 );
  })

  //
  //
  it('should follow assocToMany', async ()=> {
    // const delta = context.entities['Delta'];

    // const delta1 = await delta.findOneByAttribute( {name: 'delta1' } );
    // const alphas1 = await delta1.alphas;
    // expect( alphas1 ).toHaveLength( 3 );
    // const delta2 = await delta.findOneByAttribute( {name: 'delta2' } );
    // const alphas2 = await delta2.alphas;
    // expect( alphas2 ).toHaveLength( 2 );
    // const delta3 = await delta.findOneByAttribute( {name: 'delta3' } );
    // const alphas3 = await delta3.alphas;
    // expect( alphas3 ).toHaveLength( 0 );
  })

})
