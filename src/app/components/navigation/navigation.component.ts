import { Component, OnInit } from '@angular/core';
import { MetaDataService } from 'src/app/services/meta-data.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  constructor( private metaData:MetaDataService  ) { }

  async ngOnInit() {
    const x = await this.metaData.resolveRoutes();
    console.log( x );
  }

}
