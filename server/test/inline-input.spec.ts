import { printSchema } from 'graphql';
import _ from 'lodash';
import YAML from 'yaml';

import { Context } from '../graph-on-rails/core/context';
import { Runtime } from '../graph-on-rails/core/runtime';
import { ResolverContext } from 'graph-on-rails/core/resolver-context';

const domainConfiguration = YAML.parse(`
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
    context = runtime.context;
    console.log( printSchema( await runtime.schema() ));
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
    const alpha = context.entities['Alpha'];
    const beta = context.entities['Beta'];

    const resolverCtx:ResolverContext = { root:{}, args:{}, context:{} }
    resolverCtx.args = {
      alpha: {
        name: 'alpha3',
        beta: { name: 'betaInline', color: 'red' }
      }
    }
    await alpha.entityResolveHandler.createType( resolverCtx );
    const alpha3:any = alpha.findOneByAttribute({name: 'alpha3'});
    const betaInline = await alpha3.beta;
    expect( betaInline ).toMatchObject({ name: 'betaInline', color: 'red' })
  })

})
