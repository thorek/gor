import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import * as _ from 'lodash';
import { MetaDataService } from 'src/app/services/meta-data.service';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  metaData = null;
  entityData = null;

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
    this.route.url.subscribe( url => this.setMetaData( url ) );
  }

  /**
   *
   */
  private async setMetaData( url:UrlSegment[] ):Promise<void> {
    const path = _.get( _.first( url ), 'path' );
    const data = await this.metaDataService.resolveMetaData();
    this.metaData = _.find( data, (item:any) => _.get( item, 'path' ) === path );
    const name = _.get( this.metaData, 'name' );
    if( _.isNil( name ) ) return;
    this.entityData = await this.entityService.resolveMetaData( name );
  }
}
