import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



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
        }`
      }).valueChanges.subscribe( response => {
        const loading = _.get( response, 'data.loading' );
        if( loading ) return;
        const data = _.get( response, 'data.__type' );
        if( data ) this.metaData[entity] = data;
        resolve( data );
      });
    });
  }

  /**
   *
   */
  getIndexData( index:string, fields:string[] ):Observable<unknown> {
    const query = gql`query {\n${index} { ${_.join(fields, '\n') } } \n }`;
    console.log( query );
    return this.apollo.watchQuery({query}).valueChanges.pipe( map((result:any) => {
      console.log( result );
      return _.get( result, ['data', index ] );
    }));
  }

}
