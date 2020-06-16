import _ from 'lodash';

import { Context } from '../graph-on-rails/core/context';
import { ResolverContext } from '../graph-on-rails/core/resolver-context';
import { Runtime } from '../graph-on-rails/core/runtime';
import { Seeder } from '../graph-on-rails/core/seeder';

xdescribe('Validations', () => {

  let context!:Context;
  const resolverCtx:ResolverContext = { root:{}, args:{}, context:{} };

  beforeAll( async () => {
    const runtime = await Runtime.create( "test:validations", { domainConfiguration:{
      entity: {
        'Alpha': {
          attributes: {
            name: { type: 'string', required: true, unique: true, validation: { length: { minimum: 2, maximum: 20 }} },
            some: { type: 'string', required: true, unique: 'Delta' },
            foo: { type: 'int' }
          },
          assocTo: ['Delta'],
          seeds: {
            "alpha1": { name: "alpha1", some: "some1", Delta: "delta1" },
            "alpha2": { name: "alpha2", some: "some2", Delta: "delta1" },
            "alpha3": { name: "alpha3", some: "some3", Delta: "delta3" }
          }
        },
        'Beta': {
          attributes: {
            name: { type: 'string', required: true, validation: { length: { minimum: 2, maximum: 20 }} },
          },
          assocTo: [{ type: 'Delta', required: true }],
          seeds: {
            "beta1": { name: "beta1", Delta: "delta1" },
            "beta2": { name: "beta2", Delta: "delta1" }
          }
        },
        'Delta': {
          attributes: {
            name: { type: 'string' }
          },
          seeds: {
            "delta1": { name: "delta1" },
            "delta2": { name: "delta2" },
            "delta3": { name: "delta3" }
          }
        }
      }}
    });

    await runtime.server({});
    await Seeder.create( runtime.context ).seed( true );
    context = runtime.context;
  })

  it("no", () => {
    expect(true).toBeTruthy()
  })

  //
  //
  it('should validate attributes', async () => {
    const alpha = context.entities['Alpha'];
    resolverCtx.args = { alpha: { some: "some" } };
    let result = await alpha.validate( resolverCtx);
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'name',
        violation: "Name can't be blank"
      })
    ]));

    resolverCtx.args = { alpha: { name: "x" } };
    result = await alpha.validate( resolverCtx );
    expect( result ).toHaveLength( 2 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'name',
        violation: expect.stringContaining("Name is too short")
      }),
      expect.objectContaining( {
        attribute: 'some',
        violation: expect.stringContaining("Some can't be blank")
      })
    ]));

    resolverCtx.args = { alpha: { name: "Cool this", some: "Some that" } };
    result = await alpha.validate( resolverCtx );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it( 'should validate required assocTo', async () => {
    const beta = context.entities['Beta'];
    resolverCtx.args = { beta: { name: "aName" } };
    const result = await beta.validate( resolverCtx);
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'deltaId',
        violation: 'must be provided'
      })
    ]));
  })

  //
  //
  it( 'should validate existing foreignKey', async () => {
    const beta = context.entities['Beta'];
    resolverCtx.args = { beta: { name: "someName", deltaId: "1234" } };
    let result = await beta.validate( resolverCtx);
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining({
        attribute: 'deltaId',
        violation: expect.stringContaining("could not convert")
      })
    ]));

    const alpha = context.entities['Alpha']; // to get a valid but not matching id
    const alpha1:any = _.first( await alpha.findByAttribute( {name: 'alpha1'}) );
    resolverCtx.args = { beta: { name: "someName", deltaId: alpha1.id } };
    result = await beta.validate( resolverCtx );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'deltaId',
        violation: 'must refer to existing item'
      })
    ]));

    const delta = context.entities['Delta'];
    const delta1:any = await delta.findOneByAttribute({name: 'delta1'});
    expect( delta1 ).toBeDefined()
    resolverCtx.args = { beta: { name: "someName", deltaId: _.toString(delta1.id) } };
    result = await beta.validate( resolverCtx );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it('should have validation violation for unique attribute', async () => {
    const alpha = context.entities['Alpha'];

    resolverCtx.args = { alpha: { name: "alpha1", some: "some" } };
    let result = await alpha.validate( resolverCtx);
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'name',
        violation: "value 'alpha1' must be unique"
      })
    ]));
  })

  //
  //
  it('should have validation violation for unique attribute with scope', async () => {
    const alpha = context.entities['Alpha'];
    const delta = context.entities['Delta'];
    const delta1:any = _.first( await delta.findByAttribute({name: 'delta1'}) );
    const delta2:any = _.first( await delta.findByAttribute({name: 'delta2'}) );

    expect( delta1.id ).toBeDefined()

    resolverCtx.args = { alpha: { name: "alphaNeu", some: "some1", deltaId: _.toString(delta1.id) } };
    let result = await alpha.validate( resolverCtx );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'some',
        violation: "value 'some1' must be unique within scope 'Delta'"
      })
    ]));

    resolverCtx.args = { alpha: { name: "aX", some: "some1", deltaId: _.toString(delta2.id) } };
    result = await alpha.validate( resolverCtx );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it('should validate the updated item (not just the input)', async () => {
    const alpha = context.entities['Alpha'];
    const alpha1:any = _.first( await alpha.findByAttribute({name: 'alpha1'}));
    resolverCtx.args = { alpha: { id: _.toString(alpha1.id) } };
    const result = await alpha.validate( resolverCtx );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it( 'should not complain for update with the same unique value', async () => {
    const alpha = context.entities['Alpha'];
    const alpha1:any = _.first( await alpha.findByAttribute({name: 'alpha1'}));
    resolverCtx.args = { alpha: { id: _.toString(alpha1.id), name: 'alpha1' } };
    const result = await alpha.validate( resolverCtx );
    expect( result ).toHaveLength( 0 );
  })

})
