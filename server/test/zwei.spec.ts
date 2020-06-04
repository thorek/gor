import _ from 'lodash';

import { Gor } from '../graph-on-rails/core/gor';
import { GorContext } from '../graph-on-rails/core/gor-context';
import { Seeder } from '../graph-on-rails/core/seeder';

fdescribe('Schema Generation', () => {

  let gor!:Gor;

  beforeAll( async () => {
    gor = new Gor();

    const context = await GorContext.create("zwei");
    gor.addConfigs( './config-types/zwei', context );
    await gor.server({});
    await Seeder.create(_.values( gor.graphx.entities ) ).seed( true, {} );
  })

  it('should find entities', () => {
    const zwei = gor.graphx.entities['Zwei'];
    expect( zwei ).toBeDefined();
    console.log( gor.schema() );
  })

})
