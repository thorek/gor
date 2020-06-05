import _ from 'lodash';

import { Gor } from '../graph-on-rails/core/gor';
import { GorContext } from '../graph-on-rails/core/gor-context';
import { Seeder } from '../graph-on-rails/core/seeder';
import { printSchema } from 'graphql';


describe('Schema Generation', () => {

  let gor!:Gor;
  let context!:GorContext;

  beforeAll( async () => {
    gor = await Gor.create( "tests" );
    gor.addConfigFolder( './config-types/test' );
    await gor.server({});
    await Seeder.create( gor.context ).seed( true, {} );
    context = gor.context;
  })

  it( 'should generate schema', async () => {
    const schema = printSchema( await gor.schema() );
    expect( schema ).toContain("type Alpha");
    expect( schema ).toContain("type Beta");
    // console.log( schema );
  });

})
