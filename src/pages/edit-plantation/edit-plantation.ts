import { Component } from '@angular/core';
import { File } from '@ionic-native/file';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Geolocation } from '@ionic-native/geolocation';
import { ToastController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from "@angular/http";

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { PlantationDetailsPage } from '../plantation-details/plantation-details';
import { PlantationSurfacePage } from '../plantation-surface/plantation-surface';

declare var window;

@IonicPage()
@Component({
  selector: 'page-edit-plantation',
  templateUrl: 'edit-plantation.html',
})
export class EditPlantationPage {

  public avatar: string;
  propertyList: any;
  titledeedList: any;
  coordx;
  coordy;
  year_creation;
  titledeed;
  property;
  notes;
  area_acres;
  surface_ha;

  myCustomUserService;
  contactName;
  townName;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public view: ViewController, 
    public sqlite: SQLite, 
    public file: File,
    public http: Http,
    private camera:Camera, 
    private geolocation: Geolocation, 
    public toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    this.contactName = this.navParams.get('name'); 
    this.townName = this.navParams.get('name_town');
    let id_contact = this.navParams.get('id_contact');

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('icollect/avatar', {create: false}, (directory) => {  
        this.file.checkFile(this.file.externalRootDirectory + 'icollect/avatar/', id_contact + '.jpg').then((files) => { 
          this.avatar = this.file.externalRootDirectory + 'icollect/avatar/' +  id_contact + '.jpg';
        }).catch((err) => {this.avatar = 'assets/imgs/user.png';});
      },(error) => {this.avatar = 'assets/imgs/user.png'; });
    },(error) => { this.avatar = 'assets/imgs/user.png'; });

    this.propertyList = [ 
      {id_property: 0, property_name: 'Own'},
      {id_property: 1, property_name: 'lease'}
    ];

    this.titledeedList = [ 
      {titledeed_name: 'Yes'},
      {titledeed_name: 'No'}
    ];

    this.property = this.navParams.get('property');
    this.coordx = this.navParams.get('coordx');
    this.coordy = this.navParams.get('coordy');
    this.year_creation = this.navParams.get('year_creation');
    this.titledeed = this.navParams.get('titledeed');
    this.notes = this.navParams.get('notes');
    this.area_acres = this.navParams.get('area_acres');
    this.surface_ha = this.navParams.get('surface_ha'); 
  }

  CollectionPoint() {
    this.geolocation.getCurrentPosition().then((data) => {
      this.coordx = data.coords.latitude;
      this.coordy = data.coords.longitude;

    }).catch((error) => {
      console.log('Error getting location'+ error);
    });
  }

  updatePlantation() {
    let name = this.navParams.get('name'); 
    let name_town = this.navParams.get('name_town');
    let logged_id = this.navParams.get('logged_id'); 
    let company = this.navParams.get('company_name');
    let id_contact = this.navParams.get('id_contact');
    let logged_name = this.navParams.get('logged_name'); 
    let id_plantation = this.navParams.get('id_plantation'); 
    let id_primary_company = this.navParams.get('id_primary_company'); 
    let coordx = this.coordx;
    let coordy = this.coordy;
    let property = this.property;
    let year_creation = this.year_creation;
    let titledeed = this.titledeed;
    let notes = this.notes;
    let area_acres = this.area_acres;
    let surface_ha = this.surface_ha;

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("update plantation set year_creation='"+year_creation+"', titledeed='"+titledeed+"', notes='"+notes+"', area_acres='"+area_acres+"', surface_ha='"+surface_ha+"', coordx='"+coordx+"', coordy='"+coordy+"', property='"+property+"' WHERE id_plantation = "+id_plantation,{})
      .then(res => { 
        this.ticker_update();

        setTimeout( () => {
          let toast = this.toastCtrl.create({
            message: 'Update successfully saved',
            duration: 3000,
            position: 'bottom'
          });
        
          toast.onDidDismiss(() => {
            console.log('Dismissed toast');
          });
        
          toast.present();
  
          let data = {
            id_plantation : id_plantation,
            name: name,
            logged_id : logged_id,
            logged_name : logged_name,
            name_town: name_town,
            id_primary_company: id_primary_company,
            id_contact: id_contact,
            company_name : company
          };
          
          this.navCtrl.push(PlantationDetailsPage, data);

        }, 2000);

      }).catch(e => {
        console.log(e)
      });

    }).catch(e => console.log(e));  
  } 

  ticker_update() { 
    if(this.coordx != this.navParams.get('coordx')){
      this.store_ticker('coordx',this.coordx);
    }

    if(this.coordy != this.navParams.get('coordy')){
      this.store_ticker('coordy',this.coordy);
    }

    if(this.property != this.navParams.get('property')){
      this.store_ticker('property',this.property);
    }

    if(this.year_creation != this.navParams.get('year_creation')){ 
      this.store_ticker('year_creation',this.year_creation);
    }

    if(this.titledeed != this.navParams.get('titledeed')){
      this.store_ticker('titledeed',this.titledeed);
    }

    if(this.notes != this.navParams.get('notes')){
      this.store_ticker('notes',this.notes);
    }

    if(this.area_acres != this.navParams.get('area_acres')){
      this.store_ticker('area_acres',this.area_acres);
    }

    if(this.surface_ha != this.navParams.get('surface_ha')){
      this.store_ticker('surface_ha',this.surface_ha);
    }
  }

  store_ticker(field_name,field_value){ 
    let id_contact = this.navParams.get('id_contact');
    let id_plantation = this.navParams.get('id_plantation');
    let timestamp = new Date();

    this.geolocation.getCurrentPosition().then((data) => {

      this.sqlite.create({
        name: 'icollect.db',
        location: 'default'
      }).then((db: SQLiteObject) => { 
        db.executeSql("INSERT INTO mobcrmticker (contact_id, plantation_id, field_name, field_value, field_table, ticker_time, coordx, coordy, sync) VALUES ('"+id_contact+"', '"+id_plantation+"', '"+field_name+"', '"+field_value+"', 'plantation', '"+timestamp+"', '"+data.coords.latitude+"', '"+data.coords.longitude+"', 0)",{})
        .then(res => { console.log(res);  

          let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded'});
          let options = new RequestOptions({ headers: headers });

          var link = 'https://idiscover.ch/api/restifydb/postgres/mobcrmticker/';
          var myData = JSON.stringify({id_agent:id_contact, id_plantation:id_plantation, field_name:field_name, field_value:field_value, field_table:'plantation', ticker_time:timestamp, coordx:data.coords.latitude, coordy:data.coords.longitude, sync:1});
      
          var donnee = encodeURI('_data='+myData);

          this.http.post(link, donnee, options)
          .toPromise()
          .then((response) =>{  
            db.executeSql("SELECT id_mobconticker AS LastID FROM mobcrmticker ORDER BY id_mobconticker DESC LIMIT 1",{})
            .then(res => {  
                
              db.executeSql("UPDATE mobcrmticker SET sync = 1 WHERE id_mobconticker="+res.rows.item(0).LastID,{})
              .then(res => { console.log(res); })
              .catch(e => { console.log(e) });
 
            }).catch(er => { console.log(er) });
            
          }).catch((error) =>{  
            console.error('API Error : ', error.status);
            console.error('API Error : ', JSON.stringify(error));
          });

        }).catch(e => { console.log(e) });
      }).catch(e => console.log(e));

    }).catch((error) => {
      console.log('Error getting location'+ error);
    });
  }

  docOptions: CameraOptions = {
    quality: 100,
    targetWidth: 842,
    targetHeight: 596,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  plantationDocuments() {
    let id_plantation = this.navParams.get('id_plantation'); 
    let aDate = new Date(), aTime = aDate.getTime();

    this.camera.getPicture(this.docOptions).then((imagePath) => {
      let newFileName = id_plantation +"-"+ aTime + ".jpg"; 

      window.resolveLocalFileSystemURL(imagePath,(file) => {
        window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
          fileSys.root.getDirectory('icollect/plantation/', {create: true, exclusive: false}, (directory) => {
            file.moveTo(directory, newFileName,(fileEntry) => { 
              this.saveDocData(id_plantation,newFileName);
              this.myCustomUserService.SetProfilePhotoUrl(fileEntry.nativeURL);
            },(error) => { console.log('The file was unable to be moved'); });
          },(error) => { console.log('Could not get a reference to your app folder'); });
        },(error) => { console.log('Could not get a reference to the file system'); });
      });

    }, (err) => { console.log('Could not take picture') });
  }

  saveDocData(id_plantation,filename) { 
    let date =  new Date().toISOString(); 

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("INSERT INTO plantation_docs (id_plantation, doc_date, filename) VALUES ("+id_plantation+",'"+date+"','"+filename+"')", {})
      .then(res => {
      }).catch(e => { console.log(e) });
    }).catch(e => console.log(e));


    let toast = this.toastCtrl.create({
      message: 'Photo successfully saved',
      duration: 3000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  PlantationSurface() {
    let name  = this.navParams.get('name'); 
    let name_town = this.navParams.get('name_town');
    let id_contact = this.navParams.get('id_contact');
    let id_plantation = this.navParams.get('id_plantation'); 

    let data = {
      name : name,
      name_town: name_town,
      id_contact : id_contact,
      id_plantation : id_plantation
    }

    this.navCtrl.push(PlantationSurfacePage, data);
  }

  close() {
    this.view.dismiss();
  }

}
