import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gor';

  metaData: any = {};

  //
  //
  constructor(private apollo: Apollo) { }

  ngOnInit() {
    this.apollo.watchQuery<any>({
      query: gql`
        query{
          metaData {
            name
            menuLabel
            parent
          }
        }
      `
    }).valueChanges.subscribe( response => {
      const loading = _.get( response, 'data.loading' );
      if( loading ) return;
      this.metaData = _.get( response, 'data.metaData' );
    });
  }

}
