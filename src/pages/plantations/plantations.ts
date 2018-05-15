import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Http } from "@angular/http";

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { LoadingController } from 'ionic-angular';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

import { PlantationDetailsPage } from '../plantation-details/plantation-details';
import { ContactDetailsPage } from '../contact-details/contact-details';
import { AddPlantationPage } from '../add-plantation/add-plantation';

declare var window;

@IonicPage()
@Component({
  selector: 'page-plantations',
  templateUrl: 'plantations.html',
})
export class PlantationsPage {
  contactName;
  townName;
  searchTerm: string = '';
  plantations: any;
  public avatar: string;
  stored_plant = true;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public app: App, 
    public http: Http, 
    public sqlite: SQLite, 
    public file: File, 
    public loadingCtrl: LoadingController
  ) {
    
  }

  ionViewDidLoad() { 
    let id = this.navParams.get('id_contact');  
    this.townName = this.navParams.get('town_name');  
    this.contactName = this.navParams.get('name'); ; 

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('icollect/avatar', {create: false}, (directory) => {  
        this.file.checkFile(this.file.externalRootDirectory + 'icollect/avatar/', id + '.jpg').then((files) => { 
          this.avatar = this.file.externalRootDirectory + 'icollect/avatar/' +  id + '.jpg';
        }).catch((err) => {this.avatar = 'assets/imgs/user.png';});
      },(error) => {this.avatar = 'assets/imgs/user.png'; });
    },(error) => { this.avatar = 'assets/imgs/user.png'; });
    
    this.getPlantationsData();
  }

  getItems(searchbar) {
    // set q to the value of the searchbar
    var q = searchbar.srcElement.value;

    // if the value is an empty string don't filter the items
    if (!q) {
      this.getPlantationsData();
      //return;
    }
  
    this.plantations = this.plantations.filter((v) => {
      if(v.name && q) {
        if (v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  getPlantationsData() {   
    let id = this.navParams.get('id_contact');
    let contact = this.navParams.get('name'); 

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {   
      db.executeSql('SELECT p.id_plantation, p.id_contact, p.surface_ha, p.area_acres, c.town_name FROM plantation p LEFT JOIN contacts c ON p.id_contact = c.id_contact WHERE p.id_contact ='+id, {})
      .then(res => {  
       
        this.plantations = [];
        if(res.rows.length!=0){
          for(let i=0; i<res.rows.length; i++){   
            let surfaceData = 0;  
            let areaData = 0;   
  
            if(res.rows.item(i).surface_ha == "undefined") { surfaceData = 0; }
            else if(res.rows.item(i).surface_ha == "") { surfaceData = 0; }
            else { surfaceData = res.rows.item(i).surface_ha.toFixed(2); }
  
            if(res.rows.item(i).area_acres == "undefined") { areaData = 0; }
            else if(res.rows.item(i).area_acres == "") { areaData = 0; }
             else { areaData = res.rows.item(i).area_acres.toFixed(2); }
  
            this.plantations.push({ id_plantation : res.rows.item(i).id_plantation, name_town : res.rows.item(i).town_name, surface_ha : surfaceData, area_acres : areaData, name : contact });
          } 

          this.stored_plant = false;
        } else {
          this.stored_plant = true;
        }
        
      }).catch(e => {
        this.stored_plant = true;
        console.log(e)
      });
    }).catch(e => console.log(e));

    loading.dismiss(); 
  }

  

  itemPlantation(item) { 
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');
    let company = this.navParams.get('company_name');
    let id_primary_company = this.navParams.get('id_primary_company');
    let id_contact = this.navParams.get('id_contact');

    let data = {
      id_plantation : item.id_plantation,
      name: item.name,
      logged_id : logged_id,
      logged_name : logged_name,
      name_town: item.name_town,
      id_primary_company: id_primary_company,
      id_contact: id_contact,
      company_name : company
    };

    this.app.getRootNav().push(PlantationDetailsPage, data);
  }

  addPlantation() {
    let id_contact = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('town_name');
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

    this.navCtrl.push(AddPlantationPage, data)
  }

  contactDetail() {
    let id_contact = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('town_name');
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
    
    this.navCtrl.push(ContactDetailsPage, data);
  }

}
