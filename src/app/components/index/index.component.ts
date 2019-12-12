import { Component } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { CrudComponent } from 'src/app/shared/crud.component';
import { ActivatedRoute } from '@angular/router';
import { MetaDataService } from 'src/app/services/meta-data.service';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent extends CrudComponent {

  fields: string[] = [];
  dataSource:Observable<any> = null;

  get displayedColumns() { return  _.concat( this.fields, ['actions'] ) }

  /**
   *
   */
  constructor(
    protected route:ActivatedRoute,
    protected metaDataService:MetaDataService,
    protected entityService:EntityService )
  {
    super( route, metaDataService, entityService );
  }


  /**
   *
   */
  async setData():Promise<void> {
    this.setColumns();
    const list = _.get(this.metaData, 'list' );
    this.dataSource = this.entityService.getIndexData( list, this.fields )
  }

  /**
   *
   */
  private setColumns():void {
    this.fields = _.get( this.metaData, 'table' );
    this.fields = this.fields || _.map( _.filter( this.schema.fields, (field:any) =>
      _.includes( ['SCALAR', 'ENUM'], _.get( field, 'type.kind'))),
      (field:any) => field.name);
  }

}
