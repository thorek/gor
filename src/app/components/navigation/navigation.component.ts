import { Component, OnInit } from '@angular/core';
import { MetaDataService } from 'src/app/services/meta-data.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  metaData = null;

  /**
   *
   */
  constructor( private metaDataService:MetaDataService  ) { }

  /**
   *
   */
  async ngOnInit() {
    this.metaData = await this.metaDataService.resolveMetaData();
  }

}
