import _ from 'lodash';

import { Runtime } from '../graph-on-rails/core/runtime';
import { GorContext } from '../graph-on-rails/core/runtime-context';
import { Seeder } from '../graph-on-rails/core/seeder';
import { printSchema } from 'graphql';


describe('Schema Generation', () => {

  let gor!:Runtime;
  let context!:GorContext;

  beforeAll( async () => {
    gor = await Runtime.create( "tests" );
    gor.addConfigFolder( './config-types/test' );
    await gor.server({});
    await Seeder.create( gor.context ).seed( true, {} );
    context = gor.context;
  })

  fit( 'should generate schema', async () => {
    const schema = printSchema( await gor.schema() );
    expect( schema ).toContain("type Alpha");
    expect( schema ).toContain("type Beta");
    // console.log( schema );
  });

})
