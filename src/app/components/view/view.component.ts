import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { EntityService } from 'src/app/services/entity.service';
import { MetaDataService } from 'src/app/services/meta-data.service';
import { CrudComponent } from 'src/app/shared/crud.component';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent extends CrudComponent {

  properties:string[] = [];
  entity:any = {}

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
    this.properties = _.get(this.metaData, 'view.properties' ) || _.map( _.filter( this.schema.fields, (field:any) =>
      _.includes( ['SCALAR', 'ENUM'], _.get( field, 'type.kind'))),
      (field:any) => field.name);
    this.entityService.getEntityData( this.entityName, this.id, this.properties ).subscribe( entity => this.entity = entity );
  }

}
