import { printSchema } from 'graphql';
import _ from 'lodash';

import { Runtime } from '../graph-on-rails/core/runtime';
import { Seeder } from '../graph-on-rails/core/seeder';
import { Context } from '../graph-on-rails/core/context';


describe('Seeder', () => {

  let runtime!:Runtime;
  let context:Context;

  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeAll( async () => {
    runtime = await Runtime.create( "test:seeder", {
      domainConfiguration: {
        enum: {
          AngularFunctions: ['sin', 'cos', 'tan', 'cot']
        },
        entity: {
          Alpha: {
            attributes: {
              name: 'key',
              number: 'int'
            },
            assocTo: 'Beta',
            seeds: {
              "alpha1": { name: "alpha1", Beta: 'beta1' },
              "alpha2": { name: "alpha2", Beta: 'beta1', number: 2 },
              "alpha3": { name: "alpha3", Beta: 'beta2' },
              "alpha4": { name: "alpha4", number: 4 }
            }
          },
          Beta: {
            attributes: {
              name: 'key',
              af: 'AngularFunctions'
            },
            assocFrom: 'Alpha',
            seeds: {
              "beta1": { name: "beta1", af: 'sin' },
              "beta2": { name: "beta2", af: 'cos' },
              "beta3": { name: "beta3" }
            }
          },
          Delta: {
            attributes: {
              name: 'key'
            },
            assocToMany: 'Alpha',
            seeds: {
              delta1: { name: 'delta1', Alpha: ["alpha1", "alpha2", "alpha4" ] },
              delta2: { name: 'delta2', Alpha: ["alpha2"] },
              delta3: { name: 'delta3' }
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
  it('should seed attributes', async ()=> {
    const alpha = context.entities['Alpha'];
    const beta = context.entities['Beta'];

    const alpha1 = await alpha.findOneByAttribute( {name: 'alpha1'} );
    const alpha2 = await alpha.findOneByAttribute( {name: 'alpha2'} );
    const beta1 = await beta.findOneByAttribute( {name: 'beta1'} );

    if( ! alpha1 ) return expect( alpha1 ).toBeDefined();
    if( ! alpha2 ) return expect( alpha2 ).toBeDefined();
    if( ! beta1 ) return expect( beta1 ).toBeDefined();

    expect( alpha1.item ).toMatchObject({ name: 'alpha1' } )
    expect( alpha1.item.number ).toBeUndefined()
    expect( alpha2.item ).toMatchObject({ name: 'alpha2', number: 2 } )
    expect( beta1.item ).toMatchObject({ name: 'beta1', af: 'sin' } )
  });

  it( 'should seed assocTo References', async ()=> {
    const alpha = context.entities['Alpha'];
    const beta = context.entities['Beta'];

    const alpha1 = await alpha.findOneByAttribute( {name: 'alpha1'} );
    const beta1 = await beta.findOneByAttribute( {name: 'beta1'} );

    if( ! alpha1 ) return expect( alpha1 ).toBeDefined();
    if( ! beta1 ) return expect( beta1 ).toBeDefined();

    const alpha1_Beta = await alpha1.assocTo('Beta');
    expect( alpha1_Beta ).toBeDefined();
    expect( alpha1_Beta ).toEqual( beta1 );

    const alpha2 = await alpha.findOneByAttribute( {name: 'alpha2'} );
    expect( await alpha2?.assocTo('beta') ).toEqual( await alpha1?.assocTo('beta') );
    const alpha4 = await alpha.findOneByAttribute( {name: 'alpha4'} );
    expect( await alpha4?.assocTo('beta') ).toBeUndefined();
  })

  it( 'should seed assocToMany References', async ()=> {
    const delta = context.entities['Delta'];

    const delta1 = await delta.findOneByAttribute( {name: 'delta1'} );
    const delta2 = await delta.findOneByAttribute( {name: 'delta2'} );
    const delta3 = await delta.findOneByAttribute( {name: 'delta3'} );

    if( ! delta1 ) return expect( delta1 ).toBeDefined();
    if( ! delta2 ) return expect( delta2 ).toBeDefined();
    if( ! delta3 ) return expect( delta3 ).toBeDefined();

    const delta1_Alphas = await delta1.assocToMany('Alpha');
    expect( delta1_Alphas ).toHaveLength( 3 )

    const delta2_Alphas = await delta2.assocToMany('Alpha');
    expect( delta2_Alphas ).toHaveLength( 1 )
    expect( _.first(delta2_Alphas)?.item ).toMatchObject({name: 'alpha2', number: 2})

    const delta3_Alphas = await delta3.assocToMany('Alpha');
    expect( delta3_Alphas ).toHaveLength( 0 )
  })

})
