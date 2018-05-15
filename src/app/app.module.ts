import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http'; 
import { Network } from '@ionic-native/network';
import { SQLite } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
//import { Pro } from '@ionic/pro';
import { FileTransfer } from '@ionic-native/file-transfer';
import { BackgroundMode } from '@ionic-native/background-mode';

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient, HttpClientModule } from "@angular/common/http"; 

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { ContactsPage } from '../pages/contacts/contacts';
import { ContactDetailsPage } from '../pages/contact-details/contact-details';
import { EditContactPage } from '../pages/edit-contact/edit-contact';
import { PlantationsPage } from '../pages/plantations/plantations';
import { HomeMapPage } from '../pages/home-map/home-map';
import { PlantationDetailsPage } from '../pages/plantation-details/plantation-details';
import { AddPlantationPage } from '../pages/add-plantation/add-plantation';
import { EditPlantationPage } from '../pages/edit-plantation/edit-plantation';
import { ContactDocumentsPage } from '../pages/contact-documents/contact-documents';
import { EditDocumentPage } from '../pages/edit-document/edit-document';
import { CollectionPointPage } from '../pages/collection-point/collection-point';
import { PlantationSurfacePage } from '../pages/plantation-surface/plantation-surface';
import { ShowPlantationSurfacePage } from '../pages/show-plantation-surface/show-plantation-surface';
import { NewDocumentPage } from '../pages/new-document/new-document';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, "../assets/i18n/", ".json");
}

//const IonicPro = Pro.init('c05474bf', {
 // appVersion: "0.0.1"
//});


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    ContactsPage,
    ContactDetailsPage,
    EditContactPage,
    PlantationsPage,
    HomeMapPage,
    PlantationDetailsPage,
    AddPlantationPage,
    EditPlantationPage,
    ContactDocumentsPage,
    EditDocumentPage,
    CollectionPointPage,
    PlantationSurfacePage,
    ShowPlantationSurfacePage,
    NewDocumentPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    ContactsPage,
    ContactDetailsPage,
    EditContactPage,
    PlantationsPage,
    HomeMapPage,
    PlantationDetailsPage,
    AddPlantationPage,
    EditPlantationPage,
    ContactDocumentsPage,
    EditDocumentPage,
    CollectionPointPage,
    PlantationSurfacePage,
    ShowPlantationSurfacePage,
    NewDocumentPage
  ],
  providers: [
    BackgroundMode,
    FileTransfer,
    Geolocation,
    StatusBar,
    SplashScreen,
    Network,
    SQLite,
    Toast,
    Camera,
    File,
    IonicErrorHandler,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
