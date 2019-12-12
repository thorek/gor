import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map, filter, catchError } from 'rxjs/operators';
import { of } from 'rxjs';


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
    const query = gql`query { ${index} { ${_.join(fields) } } }`;
    return this.apollo.watchQuery({query}).valueChanges.pipe(
      filter((result:any) => !result.loading),
      map((result:any) => {
      if( result.error ) console.error( result.error );
      return _.get( result, ['data', index ] )
    }));
  }

  /**
   *
   */
  getEntityData( entity:string, id:string, fields:string[] ):Observable<unknown> {
    const query = gql`query { ${entity}(id: "${id}") { ${_.join(fields) } } }`;
    return this.apollo.watchQuery({query, errorPolicy: 'all'}).valueChanges.pipe(
      filter( result => !result.loading ),
      map( result => _.get( result, ['data', entity ] ),
      catchError( error => {
        if (error.graphQLErrors) error.graphQLErrors.forEach((e:any) => console.error(e));
        if (error.networkError) console.error( error.networkError );
        return of([]);
      })
    ));
  }

}
