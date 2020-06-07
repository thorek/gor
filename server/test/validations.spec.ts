import _ from 'lodash';

import { Gor } from '../graph-on-rails/core/gor';
import { GorContext } from '../graph-on-rails/core/gor-context';
import { Seeder } from '../graph-on-rails/core/seeder';
import { EntityAccessor } from '../graph-on-rails/entities/entity-accessor';

fdescribe('Validations', () => {

  let context!:GorContext;
  const accessor = new EntityAccessor();

  beforeAll( async () => {
    const gor = await Gor.create( "tests" );
    gor.addConfigFolder( './config-types/test' );
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

    result = await alpha.validate( {},{ alpha: { name: "x" } }, {} );
    expect( result ).toHaveLength( 1 );

    result = await alpha.validate( {},{ alpha: { name: "Cool this" } }, {} );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it( 'should validate required assocTo', async () => {
    const beta = context.entities['Beta']
    const result = await beta.validate( {},{ beta: { name: "someName" } }, {} );
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

    const alpha = context.entities['Alpha'];
    const a1 = _.first( await context.resolver.resolveTypes( alpha, {}, { filter: { name: { eq: "a1" } } }, {} ) );
    result = await beta.validate( {},{ beta: { name: "someName", deltaId: a1.id } }, {} );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'deltaId',
        violation: 'must refer to existing item'
      })
    ]));

    const delta = context.entities['Delta'];
    const d1 = _.first( await context.resolver.resolveTypes( delta, {}, { filter: { name: { eq: "d1" } } }, {} ) );
    result = await beta.validate( {},{ beta: { name: "someName", deltaId: d1.id } }, {} );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it('should have validation violation for unique attribute', async () => {
    const alpha = context.entities['Alpha'];

    let result = await alpha.validate( {},{ alpha: { name: "a1" } }, {} );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'name',
        violation: "value 'a1' must be unique"
      })
    ]));
  })

  //
  //
  it('should have validation violation for unique attribute with scope', async () => {
    const alpha = context.entities['Alpha'];
    const delta = context.entities['Delta'];
    const d1 = _.first( await context.resolver.resolveTypes( delta, {}, { filter: { name: { eq: "d1" } } }, {} ) );
    const d2 = _.first( await context.resolver.resolveTypes( delta, {}, { filter: { name: { eq: "d2" } } }, {} ) );

    let result = await alpha.validate( {},{ alpha: { name: "aX", some: "some1", deltaId: d1.id } }, {} );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'some',
        violation: "value 'some1' must be unique within scope 'Delta'"
      })
    ]));

    result = await alpha.validate( {},{ alpha: { name: "aX", some: "some1", deltaId: d2.id } }, {} );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it('should validate the updated item (not just the input)', async () => {
    const alpha = context.entities['Alpha'];
    const a1 = _.first( await context.resolver.findByAttribute( alpha, {name: "name", value: 'a1' } ) );
    const result = await alpha.validate( {},{ alpha: { id: a1.id } }, {} );
    expect( result ).toHaveLength( 0 );
  })

})
