import _ from 'lodash';

import { Runtime } from '../graph-on-rails/core/runtime';
import { GorContext } from '../graph-on-rails/core/runtime-context';
import { Seeder } from '../graph-on-rails/core/seeder';
import { ConfigEntity } from '../graph-on-rails/entities/config-entity';

describe('Validations', () => {

  let context!:GorContext;

  beforeAll( async () => {
    const gor = await Runtime.create( "tests:validations" );
    gor.addCustomEntities( ConfigEntity.create(
      'Alpha', {
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
    }));
    gor.addCustomEntities( ConfigEntity.create(
      'Beta', {
        attributes: {
          name: { type: 'string', required: true, validation: { length: { minimum: 2, maximum: 20 }} },
        },
        assocTo: [{ type: 'Delta', required: true }],
        seeds: {
          "beta1": { name: "beta1", Delta: "delta1" },
          "beta2": { name: "beta2", Delta: "delta1" }
        }
    }));
    gor.addCustomEntities( ConfigEntity.create(
      'Delta', {
        attributes: {
          name: { type: 'string' }
        },
        seeds: {
          "delta1": { name: "delta1" },
          "delta2": { name: "delta2" },
          "delta3": { name: "delta3" }
        }
    }));

    await gor.server({});
    await Seeder.create( gor.context ).seed( true, {} );
    context = gor.context;
  })

  //
  //
  it('should validate attributes', async () => {
    const alpha = context.entities['Alpha'];

    let result = await alpha.validate( {},{ alpha: { some: "some" } }, {} );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'name',
        violation: "Name can't be blank"
      })
    ]));

    result = await alpha.validate( {},{ alpha: { name: "x" } }, {} );
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

    result = await alpha.validate( {},{ alpha: { name: "Cool this", some: "Some that" } }, {} );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it( 'should validate required assocTo', async () => {
    const beta = context.entities['Beta'];
    const result = await beta.validate( {},{ beta: { name: "aName" } }, {} );
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
    const beta = context.entities['Beta']
    let result = await beta.validate( {},{ beta: { name: "someName", deltaId: "1234" } }, {} );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining({
        attribute: 'deltaId',
        violation: expect.stringContaining("could not convert")
      })
    ]));

    const alpha = context.entities['Alpha']; // to get a valid but not matching id
    const alpha1 = _.first( await context.resolver.resolveTypes( alpha, {}, { filter: { name: { is: "alpha1" } } }, {} ) );
    result = await beta.validate( {},{ beta: { name: "someName", deltaId: alpha1.id } }, {} );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'deltaId',
        violation: 'must refer to existing item'
      })
    ]));

    const delta = context.entities['Delta'];
    const delta1 = _.first( await context.resolver.resolveTypes( delta, {}, { filter: { name: { is: "delta1" } } }, {} ) );
    result = await beta.validate( {},{ beta: { name: "someName", deltaId: delta1.id } }, {} );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it('should have validation violation for unique attribute', async () => {
    const alpha = context.entities['Alpha'];

    let result = await alpha.validate( {},{ alpha: { name: "alpha1", some: "some" } }, {} );
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
    const delta1 = _.first( await context.resolver.resolveTypes( delta, {}, { filter: { name: { is: "delta1" } } }, {} ) );
    const delta2 = _.first( await context.resolver.resolveTypes( delta, {}, { filter: { name: { is: "delta2" } } }, {} ) );

    let result = await alpha.validate( {},{ alpha: { name: "alphaNeu", some: "some1", deltaId: _.toString(delta1.id) } }, {} );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'some',
        violation: "value 'some1' must be unique within scope 'Delta'"
      })
    ]));

    result = await alpha.validate( {},{ alpha: { name: "aX", some: "some1", deltaId: _.toString(delta2.id) } }, {} );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it('should validate the updated item (not just the input)', async () => {
    const alpha = context.entities['Alpha'];
    const alpha1 = _.first( await context.resolver.findByAttribute( alpha, {name: 'alpha1' } ) );
    const result = await alpha.validate( {},{ alpha: { id: _.toString(alpha1.id) } }, {} );
    expect( result ).toHaveLength( 0 );
  })

})
