import _ from 'lodash';

import { Runtime } from '../graph-on-rails/core/runtime';
import { GorContext } from '../graph-on-rails/core/runtime-context';
import { Seeder } from '../graph-on-rails/core/seeder';
import { ConfigEntity } from '../graph-on-rails/entities/config-entity';

xdescribe('Virtual Attributes', () => {

  let context!:GorContext;
  jest.spyOn(global.console, 'warn').mockImplementation();
  beforeAll( async () => {
    const gor = await Runtime.create( "tests:virtual-attributes" );
    gor.addCustomEntities( ConfigEntity.create( 'Alpha', {
      attributes: {
        name: { type: 'string' },
        notReal: { type: 'string', virtual: true },
      },
      seeds: {
        "alpha1": { name: "alpha1" },
        "alpha2": { name: "alpha2" }
      }
    }));
    await gor.server();
    await Seeder.create( gor.context ).seed( true, {} );
    context = gor.context;
  })

  //
  //
  it('should resolve a virtual attribute', async () => {
    _.set( context.virtualResolver, 'Alpha', {
      notReal: () => { return "virtually resolved" }
    })

    jest.spyOn(global.console, 'warn').mockImplementation();

    const alpha = context.entities['Alpha'];
    const alpha1 = _.first( await alpha.findByAttribute( {root:{}, args:{}, context:{}}, {name: "name", value: 'alpha1' } ) );

    expect( alpha1 ).toMatchObject({ name: "alpha1" } );
    expect( alpha1 ).toMatchObject({ notReal: "virtually resolved" } );
  })

})
