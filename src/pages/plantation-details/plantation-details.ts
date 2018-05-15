import { Component } from '@angular/core';
import { File } from '@ionic-native/file';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Geolocation } from '@ionic-native/geolocation';
import { Http, Headers, RequestOptions } from "@angular/http";

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { ShowPlantationSurfacePage } from '../show-plantation-surface/show-plantation-surface';
import { EditPlantationPage } from '../edit-plantation/edit-plantation';
import { ContactDetailsPage } from '../contact-details/contact-details';
import { CollectionPointPage } from '../collection-point/collection-point';
import { PlantationsPage } from '../plantations/plantations';

declare var window;

@IonicPage()
@Component({
  selector: 'page-plantation-details',
  templateUrl: 'plantation-details.html',
})
export class PlantationDetailsPage {
  public avatar: string;
  public image = 'assets/imgs/plantation.png';
  contactName;
  townName;

  id_plantation;
  id_contact;
  id_town;
  coordx;
  coordy;
  year_creation;
  titledeed;
  property;
  notes;
  area_acres;
  surface_ha;
  id_primary_company;
  fieldNumber;

  surface_ha_sync_yes = false;
  surface_ha_sync_no = false;
  area_acres_sync_yes = false;
  area_acres_sync_no = false;
  year_creation_sync_yes = false;
  year_creation_sync_no = false;
  property_sync_yes = false;
  property_sync_no = false;
  titledeed_sync_yes = false;
  titledeed_sync_no = false;
  notes_sync_yes = false;
  notes_sync_no = false;

  saved_plantation = false;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private geolocation: Geolocation, 
    public http: Http,
    public app: App, 
    public file: File, 
    public sqlite: SQLite
  ){  }

  ionViewDidLoad() {
    this.PlantationImage();
    let id_plantation = this.navParams.get('id_plantation');  
    this.contactName = this.navParams.get('name');  
    let id_contact = this.navParams.get('id_contact');
    this.townName = this.navParams.get('name_town');  

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('icollect/avatar', {create: false}, (directory) => {  
        this.file.checkFile(this.file.externalRootDirectory + 'icollect/avatar/', id_contact + '.jpg').then((files) => { 
          this.avatar = this.file.externalRootDirectory + 'icollect/avatar/' +  id_contact + '.jpg';
        }).catch((err) => {this.avatar = 'assets/imgs/user.png';});
      },(error) => {this.avatar = 'assets/imgs/user.png'; });
    },(error) => { this.avatar = 'assets/imgs/user.png'; });

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT id_plantation, plantationsite_id, id_contact, id_town, coordx, coordy, geo_json, year_creation, titledeed, notes, area_acres, property, surface_ha FROM plantation WHERE id_plantation ='+id_plantation, {})
      .then(res => { 

        if(res.rows.item(0).geo_json){
          this.saved_plantation = true;
        } else { this.saved_plantation = false; }
        
        this.id_plantation = res.rows.item(0).id_plantation;
        this.id_contact = res.rows.item(0).id_contact;
        this.id_town = res.rows.item(0).id_town;
        this.coordx = res.rows.item(0).coordx;
        this.coordy = res.rows.item(0).coordy;
        this.year_creation = res.rows.item(0).year_creation;
        this.titledeed = res.rows.item(0).titledeed;
        this.notes = res.rows.item(0).notes;
        this.area_acres = res.rows.item(0).area_acres;
        this.surface_ha = res.rows.item(0).surface_ha; 
        this.fieldNumber = res.rows.item(0).code_plantation;

        let stored_property;
        if(res.rows.item(0).property == 1){
          stored_property = 'Lease';
        } else { stored_property = 'Own'; }  
        this.property = stored_property;

      }).catch(e => { console.log(e) });
    }).catch(e => console.log(e));

    this.syncInfo();
  }

  PlantationImage() {
    let id_plantation = this.navParams.get('id_plantation');

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => { 
      db.executeSql('SELECT filename FROM plantation_docs WHERE id_plantation ='+id_plantation+' LIMIT 1', {})
      .then(res => { 
        window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
          fileSys.root.getDirectory('icollect/plantation', {create: false}, (directory) => {  
            for(let i=0; i<res.rows.length; i++){   
              this.image = this.file.externalRootDirectory + 'icollect/plantation/' +  res.rows.item(i).filename;
            } 
          },(error) => {this.image = 'assets/imgs/plantation.png'; });
        },(error) => { this.image = 'assets/imgs/plantation.png'; });

      }).catch(e => { this.image = 'assets/imgs/plantation.png'; });
    }).catch(e => console.log(e));
  }

  syncInfo() { 
    let id_plantation = this.navParams.get('id_plantation');

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("SELECT sync, field_name FROM mobcrmticker WHERE field_table = 'plantation' AND plantation_id ="+id_plantation, {})
      .then(res => { 

        for(let i=0; i<res.rows.length; i++){ 
         
          if(res.rows.item(i).field_name == 'surface_ha'){  
            if(res.rows.item(i).sync == 1){ 
              this.surface_ha_sync_yes = true; 
              this.surface_ha_sync_no = false;
            } else { 
              this.surface_ha_sync_no = true; 
              this.surface_ha_sync_yes = false;
            }
          }

          if(res.rows.item(i).field_name == 'area_acres'){ 
            if(res.rows.item(i).sync == 1){ 
              this.area_acres_sync_yes = true; 
              this.area_acres_sync_no = false;
            } else { 
              this.area_acres_sync_no = true; 
              this.area_acres_sync_yes = false;
            }
          }

          if(res.rows.item(i).field_name == 'year_creation'){ 
            if(res.rows.item(i).sync == 1){ 
              this.year_creation_sync_yes = true; 
              this.year_creation_sync_no = false; 
            } else { 
              this.year_creation_sync_no = true; 
              this.year_creation_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'property'){ 
            if(res.rows.item(i).sync == 1){ 
              this.property_sync_yes = true; 
              this.property_sync_no = false; 
            } else { 
              this.property_sync_no = true; 
              this.property_sync_yes = false; 
            }
          }
          
          if(res.rows.item(i).field_name == 'titledeed'){ 
            if(res.rows.item(i).sync == 1){ 
              this.titledeed_sync_yes = true; 
              this.titledeed_sync_no = false; 
            } else { 
              this.titledeed_sync_no = true; 
              this.titledeed_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'notes'){ 
            if(res.rows.item(i).sync == 1){ 
              this.notes_sync_yes = true; 
              this.notes_sync_no = false; 
            } else { 
              this.notes_sync_no = true; 
              this.notes_sync_yes = false; 
            }
          }

        } 

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


  editPlantation() { 
    let id_plantation = this.navParams.get('id_plantation');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('name_town');
    let name = this.navParams.get('name');
    let id_primary_company = this.navParams.get('id_primary_company');
  
    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => { 
      db.executeSql('SELECT id_plantation, plantationsite_id, id_contact, id_town, coordx, coordy, year_creation, titledeed, notes, area_acres, surface_ha, property FROM plantation WHERE id_plantation ='+id_plantation, {})
      .then(res => { 

        let data = {
          id_plantation : id_plantation,
          id_contact : res.rows.item(0).id_contact,
          id_town : res.rows.item(0).id_town,
          coordx : res.rows.item(0).coordx,
          coordy : res.rows.item(0).coordy,
          year_creation : res.rows.item(0).year_creation,
          titledeed : res.rows.item(0).titledeed,
          notes : res.rows.item(0).notes,
          area_acres : res.rows.item(0).area_acres,
          surface_ha : res.rows.item(0).surface_ha,
          property : res.rows.item(0).property,
          name : name,
          name_town : town_name,
          logged_id : logged_id,
          logged_name : logged_name,
          company_name : company,
          id_primary_company: id_primary_company
        }; 

        this.navCtrl.push(EditPlantationPage, data); 

      }).catch(e => {
        console.log(e)
      });
    }).catch(e => console.log(e));
  }

  contactDetails() {
    let id_contact = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('name_town');
    let name = this.navParams.get('name');
    let id_primary_company = this.navParams.get('id_primary_company'); 
    
    let data = {
      name : name,
      logged_id : logged_id,
      id_contact : id_contact,
      logged_name : logged_name,
      town_name : town_name,
      id_primary_company : id_primary_company,
      company_name : company
    };

    this.app.getRootNav().push(ContactDetailsPage, data);
  }

  plantationList() {
    let id_contact = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('name_town');
    let name = this.navParams.get('name');
    let id_primary_company = this.navParams.get('id_primary_company'); 

    let data = {
      name : name,
      logged_id : logged_id,
      id_contact : id_contact,
      logged_name : logged_name,
      town_name : town_name,
      id_primary_company : id_primary_company,
      company_name : company
    };

    this.navCtrl.push(PlantationsPage, data);
  }

  CollectionPoint() { 
    let id_plantation = this.navParams.get('id_plantation');
    let id_contact = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('name_town');
    let name = this.navParams.get('name');
    let id_primary_company = this.navParams.get('id_primary_company'); 

    let data = {
      name : name,
      logged_id : logged_id,
      id_contact : id_contact,
      logged_name : logged_name,
      town_name : town_name,
      id_plantation : id_plantation,
      id_primary_company : id_primary_company,
      company_name : company
    };

    this.navCtrl.push(CollectionPointPage, data);
  }

  plantationSurface() {
    let id_plantation = this.navParams.get('id_plantation');
    let id_contact = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('name_town');
    let name = this.navParams.get('name');
    let id_primary_company = this.navParams.get('id_primary_company'); 

    let data = {
      name : name,
      logged_id : logged_id,
      id_contact : id_contact,
      logged_name : logged_name,
      town_name : town_name,
      id_plantation : id_plantation,
      id_primary_company : id_primary_company,
      company_name : company
    };

    this.navCtrl.push(ShowPlantationSurfacePage, data);
  }

} 
