import { printSchema } from 'graphql';
import _ from 'lodash';

import { Runtime } from '../graph-on-rails/core/runtime';
import { Seeder } from '../graph-on-rails/core/seeder';
import { Context } from '../graph-on-rails/core/context';

describe('Virtual Attributes', () => {

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
              "beta2": { name: "beta2" }
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
    expect( alpha1 ).toMatchObject({name: 'alpha1', betaId: _.toString(beta1.id)})
    expect( await alpha1.beta ).toEqual( beta1 );
    const alpha2 = await alpha.findOneByAttribute( {name: 'alpha2'} );
    expect( await alpha2.beta ).toEqual( await alpha1.beta );
  })

  //
  //
  it('should follow assocFrom', async ()=> {
    const beta = context.entities['Beta'];
    const beta1 = await beta.findOneByAttribute( {name: 'beta1'} );
    const alphas = await beta1.alphas;
    expect( alphas ).toHaveLength( 2 );
    expect( alphas ).toEqual( expect.arrayContaining([
      expect.objectContaining( { name: 'alpha1' }),
      expect.objectContaining( { name: 'alpha2' })
    ]));
  })

  //
  //
  it('should follow assocToMany', async ()=> {
    const delta = context.entities['Delta'];

    const delta1 = await delta.findOneByAttribute( {name: 'delta1' } );
    const alphas = await delta1.alphas;
    expect( alphas ).toHaveLength( 3 );
  })

})
