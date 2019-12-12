import { OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import * as _ from 'lodash';
import { EntityService } from 'src/app/services/entity.service';
import { MetaDataService } from 'src/app/services/meta-data.service';

export abstract class CrudComponent implements OnInit {

  index:string;
  id:string|null;
  entityName:string;
  metaData = null;
  schema = null;

  /**
   *
   */
  constructor(
    protected route:ActivatedRoute,
    protected metaDataService:MetaDataService,
    protected entityService:EntityService )
  { }

  /**
   *
   */
  ngOnInit() {
    this.route.params.subscribe( async params => {
      this.index = _.get( params, 'index' );
      if( _.isNil( this.index ) ) return console.warn( `need 'index' in url` );
      this.id  = _.get( params, 'id' );
      await this.setMetaData();
      this.setData();
    });
  }


  /**
   *
   */
  protected abstract setData():void;


  /**
   *
   */
  private async setMetaData():Promise<void> {
    const data = await this.metaDataService.resolveMetaData();
    this.metaData = _.find( data, (item:any) => _.get( item, 'path' ) === this.index );
    if( _.isNil( this.metaData ) ) throw new Error(`cannot find metadata for '${this.index}'`)
    const name = _.get( this.metaData, 'name' );
    this.entityName = _.get(this.metaData, 'entity' );
    this.schema = await this.entityService.resolveMetaData( name );
  }


  /**
   *
   */
  onDelete():boolean {
    console.log( "onDelete clicked" );
    return false;
  }
}
