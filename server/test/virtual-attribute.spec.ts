import _ from 'lodash';

import { Gor } from '../graph-on-rails/core/gor';
import { GorContext } from '../graph-on-rails/core/gor-context';
import { Seeder } from '../graph-on-rails/core/seeder';

describe('Virtual Attributes', () => {

  let context!:GorContext;

  beforeAll( async () => {
    const gor = await Gor.create( "tests" );
    gor.addConfigFolder( './config-types/test' );
    await gor.server({});
    await Seeder.create( gor.context ).seed( true, {} );
    context = gor.context;
  })

  //
  //
  it('should resolve a virtual attribute', async () => {
    _.set( context.virtualResolver, 'Phi', {
      notReal: () => { return "virtually resolved" }
    })

    const phi = context.entities['Phi'];
    const phi1 = _.first( await context.resolver.findByAttribute( phi, {name: "name", value: 'phi1' } ) );

    expect( phi1 ).toMatchObject({ name: "phi1" } );
    expect( phi1 ).toMatchObject({ notReal: "virtually resolved" } );
  })

})
