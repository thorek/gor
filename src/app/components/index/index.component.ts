import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import * as _ from 'lodash';
import { MetaDataService } from 'src/app/services/meta-data.service';
import { EntityService } from 'src/app/services/entity.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  metaData = null;
  entityData = null;
  displayedColumns: string[] = [];
  dataSource:Observable<any> = null;

  /**
   *
   */
  constructor(
    private route:ActivatedRoute,
    private metaDataService:MetaDataService,
    private entityService:EntityService )
  { }

  /**
   *
   */
  async ngOnInit() {
    this.route.url.subscribe( url => this.onLoad( url ) );
  }

  /**
   *
   */
  private async onLoad( url:UrlSegment[] ) {
    const path = _.get( _.first( url ), 'path' );
    await this.setMetaData( path );
    this.setDisplayedColumns();
    this.setData();
  }

  /**
   *
   */
  async setData():Promise<void> {
    const list = _.get(this.metaData, 'list' );
    this.dataSource = this.entityService.getIndexData( list, this.displayedColumns )
  }

  /**
   *
   */
  private async setMetaData( path:string ):Promise<void> {
    const data = await this.metaDataService.resolveMetaData();
    this.metaData = _.find( data, (item:any) => _.get( item, 'path' ) === path );
    if( _.isNil( this.metaData ) ) throw new Error(`cannot find metadata for '${path}'`)
    const name = _.get( this.metaData, 'name' );
    this.entityData = await this.entityService.resolveMetaData( name );
  }

  /**
   *
   */
  private setDisplayedColumns():void {
    this.displayedColumns = _.get( this.metaData, 'table' );
    this.displayedColumns = this.displayedColumns || _.map( _.filter(
      this.entityData.fields, (field:any) => _.get( field, 'type.kind') === 'SCALAR'), (field:any) => field.name);
  }

}
