import { printSchema } from 'graphql';
import _ from 'lodash';
import YAML from 'yaml';

import { Context } from '../graph-on-rails/core/context';
import { Runtime } from '../graph-on-rails/core/runtime';

const domainConfiguration = YAML.parse(
  `
  enum:
    Color:
      - red
      - green
      - yellow

  entity:
    Alpha:
      attributes:
        name: key
      assocTo:
        - type: Beta
          input: true

    Beta:
      attributes:
        name: key
        color: Color!
  `);

describe('Inline Input', () => {

  let context!:Context;

  beforeAll( async () => {
    const runtime = await Runtime.create( "test:inline-input", { domainConfiguration } );
    await runtime.server({});
    console.log( printSchema( await runtime.schema() ));
    context = runtime.context;
  })

  it('should find create entities',  async () => {
    const alpha = context.entities['Alpha'];
    expect( alpha ).toBeDefined();
    const beta = context.entities['Beta'];
    expect( beta ).toBeDefined();
    await beta.entityResolveHandler.createType( {root:{}, args:{ beta: { name: 'beta1', color: 'RED'} }, context:{} } );
    const beta1 = await beta.findOneByAttribute( {name: 'beta1' } );
    expect( beta1 ).toEqual( expect.objectContaining( {name: 'beta1', color: 'RED' }) );
    await alpha.entityResolveHandler.createType( {root:{}, args:{ alpha: { name: 'alpha1', betaId: _.toString(beta1.id)} }, context:{} } );
    const alpha1 = await alpha.findOneByAttribute( {name: 'alpha1' } );
    expect( alpha1 ).toEqual( expect.objectContaining( { name: 'alpha1', betaId: _.toString( beta1.id ) } ) );
  })


  it('should find create entities with inline input',  async () => {
    // const alpha = context.entities['Alpha'];
    // expect( alpha ).toBeDefined();
    // const beta = context.entities['Beta'];
    // expect( beta ).toBeDefined();
    // await alpha.entityResolveHandler.createType( {root:{}, args:{ alpha: { name: 'alpha1', beta: { name: 'beta2', color: 'GREEN'}} }, context:{} } );
    // const alpha1 = await beta.findOneByAttribute( {name: 'alpha1' } );
    // expect( beta1 ).toEqual( expect.objectContaining( { name: 'beta1', color: 'RED' } ) );
  })

})
