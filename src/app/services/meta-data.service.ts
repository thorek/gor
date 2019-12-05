import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import _ from 'lodash';
import { resolve } from 'url';
import { AppComponent } from '../components/app/app.component';


@Injectable({
  providedIn: 'root'
})
export class MetaDataService {

  metaData: any = {};

  /**
   *
   */
  constructor( private router:Router, private apollo: Apollo ) { }

  /**
   *
   */
  async resolveRoutes():Promise<any> {
    return new Promise( resolve => {
      this.apollo.watchQuery<any>({
        query: gql`
          query{
            metaData {
              name
              path
              label
              parent
            }
          }
        `
      }).valueChanges.subscribe( response => {
        const loading = _.get( response, 'data.loading' );
        if( loading ) return;
        this.metaData = _.get( response, 'data.metaData' );
        this.addRoutes();
        resolve( this.metaData );
      });
    });
  }

  /**
   *
   */
  private addRoutes():void {
    const routes = _.flatten( _.map( this.metaData, (item:any) => [
      { path: item.path, component: AppComponent },
      { path: `${item.path}/:id`, component: AppComponent }
    ]));
    this.router.resetConfig( routes );
  }
}
