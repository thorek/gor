import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import _ from 'lodash';
import { resolve } from 'url';

import { AppComponent } from '../components/app/app.component';
import { IndexComponent } from '../components/index/index.component';


@Injectable({
  providedIn: 'root'
})
export class EntityService {

  private metaData:{[name:string]:any} = {};

  /**
   *
   */
  constructor( private apollo: Apollo ) { }

  /**
   *
   */
  async resolveMetaData( entity:string ):Promise<any> {
    const data = this.metaData[entity];
    if( data ) return new Promise( resolve => resolve( data ) );

    return new Promise( resolve => {
      this.apollo.watchQuery<any>({
        query: gql`
        {
          __type(name: "${entity}") {
            name
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }        `
      }).valueChanges.subscribe( response => {
        const loading = _.get( response, 'data.loading' );
        if( loading ) return;
        const data = _.get( response, 'data.__type' );
        if( data ) this.metaData[entity] = data;
        resolve( data );
      });
    });
  }
}
