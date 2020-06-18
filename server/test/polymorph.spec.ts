import { printSchema } from 'graphql';
import _ from 'lodash';
import YAML from 'yaml';

import { Context } from '../graph-on-rails/core/context';
import { Runtime } from '../graph-on-rails/core/runtime';
import { ResolverContext } from '../graph-on-rails/core/resolver-context';
import { Seeder } from '../graph-on-rails/core/seeder';

const domainConfiguration = YAML.parse(`
  entity:
    Alpha:
      attributes:
        name: key
      seeds:
        alpha1:
          name: alpha1
        alpha2:
          name: alpha2
        alpha3:
          name: alpha3

    Beta:
      attributes:
        name: key
      seeds:
        beta1:
          name: beta1
        beta2:
          name: beta2

    AlphaBeta:
      union:
        - Alpha
        - Beta

    Delta:
      attributes:
        name: key
      assocTo: AlphaBeta
      assocFrom: Super
      seeds:
        delta1:
          name: delta1
          AlphaBeta:
            id: alpha1
            type: Alpha
        delta2:
          name: delta2
          AlphaBeta:
            id: alpha2
            type: Alpha
        delta3:
          name: delta3
          AlphaBeta:
            id: beta1
            type: Beta

    Super:
      interface: true
      attributes:
        name: key
      assocTo: Delta

    ImplementA:
      implements: Super
      attributes:
        aAttr: string
      seeds:
        ia1:
          name: ia1
          aAttr: the value 1
          Delta: delta1

    ImplementB:
      implements: Super
      attributes:
        bAttr: int
      seeds:
        ib1:
          name: ib1
          cAttr: 1
          Delta: delta1

`);

describe('Ploymorph Types', () => {

  let context!:Context;

  beforeAll( async () => {
    const runtime = await Runtime.create( "test:polymorph", { domainConfiguration } );
    await runtime.server({});
    await Seeder.create( runtime.context ).seed( true );
    context = runtime.context;
    // console.log( printSchema( await runtime.schema() ));
  })

  it('should find polymorph assocTo',  async () => {
    const delta = context.entities['Delta'];
    const delta1 = await delta.findOneByAttribute( {name: 'delta1' } );
    if( ! delta1 ) return expect( delta1 ).toBeDefined();
    const ab1 = await delta1.assocTo('AlphaBeta');
    if( ! ab1 ) return expect( ab1 ).toBeDefined();
    expect( ab1.item ).toMatchObject({name: 'alpha1'})

    const delta3 = await delta.findOneByAttribute( {name: 'delta3' } );
    if( ! delta3 ) return expect( delta3 ).toBeDefined();
    const ab3 = await delta3.assocTo('AlphaBeta')
    if( ! ab3 ) return expect( ab3 ).toBeDefined();
    expect( ab3.item ).toMatchObject({name: 'beta1'})
  })

  it( 'should resolve polymorph assocFrom', async () => {
    const delta = context.entities['Delta'];
    const delta1 = await delta.findOneByAttribute( {name: 'delta1' } );
    if( ! delta1 ) return expect( delta1 ).toBeDefined();
    const supers = await delta1.assocFrom('Super')
    expect( supers ).toHaveLength( 2 );
  })


})
