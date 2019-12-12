import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { AppComponent } from './components/app/app.component';
import { IndexComponent } from './components/index/index.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ViewComponent } from './components/view/view.component';


const appRoutes: Routes = [
    {path: 'gor/:index', component: IndexComponent },
    {path: 'gor/:index/:id', component: ViewComponent },
    {path: 'gor/:index/:id/edit', component: ViewComponent },
    {path: 'gor/:index/:id/new', component: ViewComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    IndexComponent,
    ViewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
    MatTableModule,
    RouterModule.forRoot(appRoutes)
  ],
  entryComponents: [
    IndexComponent,
    ViewComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

  /**
   *
   */
  constructor(apollo: Apollo, httpLink: HttpLink) {
    apollo.create({
      link: httpLink.create({uri: 'http://localhost:3000/graphql'}),
      cache: new InMemoryCache()
    });
  }
}
