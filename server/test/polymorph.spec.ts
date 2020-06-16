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

  it('should find create entities',  async () => {
    const delta = context.entities['Delta'];
    const delta1:any = await delta.findOneByAttribute( {name: 'delta1' } );
    const ab1 = await delta1.alphaBeta
    expect( ab1 ).toMatchObject({name: 'alpha1'})

    const delta3:any = await delta.findOneByAttribute( {name: 'delta3' } );
    const ab3 = await delta3.alphaBeta
    expect( ab3 ).toMatchObject({name: 'beta1'})
  })



})
