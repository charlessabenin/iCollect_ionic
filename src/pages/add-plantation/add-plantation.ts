import { Component } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { File } from '@ionic-native/file';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Geolocation } from '@ionic-native/geolocation';
import { ToastController } from 'ionic-angular';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { PlantationsPage } from '../plantations/plantations'; 
import { PlantationSurfacePage } from '../plantation-surface/plantation-surface';

@IonicPage()
@Component({
  selector: 'page-add-plantation',
  templateUrl: 'add-plantation.html',
})
export class AddPlantationPage {
  id_town;
  coordx;
  coordy;
  year_creation;
  titledeed;
  notes;
  area_acres; 
  surface_ha;
  propertyList: any;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public view: ViewController, 
    public sqlite: SQLite, 
    public http: Http,
    public file: File,
    private geolocation: Geolocation,
    public toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    this.propertyList = [
      {id_property: 0, property_name: 'Own'},
      {id_property: 1, property_name: 'lease'}
    ];
  }

  savePlantation() {
    let id_contact = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('town_name');
    let name = this.navParams.get('name');
    let id_primary_company = this.navParams.get('id_primary_company');

    let coordx = this.coordx;
    let coordy = this.coordy;
    let year_creation = this.year_creation; 
    let titledeed = this.titledeed; 
    let notes = this.notes;  
    let area_acres = this.area_acres; 
    let surface_ha = this.surface_ha; 

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("INSERT INTO plantation (id_contact, year_creation, titledeed, notes, area_acres, surface_ha, coordx, coordy) VALUES ('"+id_contact+"', '"+year_creation+"', '"+titledeed+"', '"+notes+"', '"+area_acres+"', '"+surface_ha+"', '"+coordx+"', '"+coordy+"')",{})
      .then(res => {  
        this.ticker_update();

        setTimeout( () => {
          let toast = this.toastCtrl.create({
            message: 'Update successfully added',
            duration: 3000,
            position: 'bottom' 
          });
        
          toast.onDidDismiss(() => {
            console.log('Dismissed toast');
          });
        
          toast.present();

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
        }, 2000);

      }).catch(e => {
        console.log(e)
        let toast = this.toastCtrl.create({
          message: 'Plantation not saved',
          duration: 3000,
          position: 'bottom'
        });
      
        toast.onDidDismiss(() => {
          console.log('Dismissed toast');
        });
      
        toast.present();
      });

    }).catch(e => console.log(e));
  }

  ticker_update() {
    if(this.coordx != ""){
      this.store_ticker('geo_json',this.coordx);
    }

    if(this.coordy != ""){
      this.store_ticker('area_acres',this.coordy);
    }

    if(this.year_creation != ""){
      this.store_ticker('surface_ha',this.year_creation);
    }

    if(this.titledeed != ""){
      this.store_ticker('surface_ha',this.titledeed);
    }

    if(this.notes != ""){
      this.store_ticker('surface_ha',this.notes);
    }

    if(this.area_acres != ""){
      this.store_ticker('surface_ha',this.area_acres);
    }

    if(this.surface_ha != ""){
      this.store_ticker('surface_ha',this.surface_ha);
    }
  }

  store_ticker(field_name,field_value){
    let id_contact = this.navParams.get('id_contact');
    let timestamp = new Date();

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("SELECT id_plantation FROM plantation ORDER BY id_plantation DESC LIMIT 1",{})
      .then(res => { 
        let id_plantation = res.rows.item(0).id_plantation;

        this.geolocation.getCurrentPosition().then((data) => {

          db.executeSql("INSERT INTO mobcrmticker (contact_id, plantation_id, field_name, field_value, field_table, ticker_time, coordx, coordy, sync) VALUES ('"+id_contact+"', '"+id_plantation+"', '"+field_name+"', '"+field_value+"', 'plantation', '"+timestamp+"', '"+data.coords.latitude+"', '"+data.coords.longitude+"', 0)",{})
          .then(res => { console.log(res);

            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded'});
            let options = new RequestOptions({ headers: headers });

            var link = 'https://idiscover.ch/api/restifydb/postgres/mobcrmticker/';
            var myData = JSON.stringify({id_contact:id_contact, plantation_id:id_plantation, field_name:field_name, field_value:field_value, field_table:'contact', ticker_time:timestamp, coordx:data.coords.latitude, coordy:data.coords.longitude, sync:1});
        
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

        }).catch((error) => {
          console.log('Error getting location'+ error);
        });

      }, error => { console.log("Oooops!"); }); 
    }).catch(e => console.log(e));
  }

  CollectionPoint() {
    this.geolocation.getCurrentPosition().then((data) => {
      this.coordx = data.coords.latitude;
      this.coordy = data.coords.longitude;

    }).catch((error) => {
      console.log('Error getting location'+ error);
    });
  }

  close() {
    this.view.dismiss();
  }

}
