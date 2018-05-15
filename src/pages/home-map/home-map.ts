import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';
import { ToastController } from 'ionic-angular';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation';

import { PlantationsPage } from '../plantations/plantations';
import { ContactDetailsPage } from '../contact-details/contact-details';

declare var window;
declare var google;

@IonicPage()
@Component({
  selector: 'page-home-map',
  templateUrl: 'home-map.html',
})
export class HomeMapPage {
  public avatar: string;
  options : GeolocationOptions;
  currentPos : Geoposition;
  selectedShape: any;

  @ViewChild('homeMap') mapElement: ElementRef;
  map: any;

  contactName;
  townName;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private geolocation : Geolocation,
    public file: File,
    public toastCtrl: ToastController,
    public network: Network,
    public sqlite: SQLite) {
    
  }

  ionViewDidEnter() {
    let id = this.navParams.get('id_contact');
    this.contactName = this.navParams.get('name'); 
    this.townName = this.navParams.get('town_name');  

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('icollect/avatar', {create: false}, (directory) => {  
        this.file.checkFile(this.file.externalRootDirectory + 'icollect/avatar/', id + '.jpg').then((files) => { 
          this.avatar = this.file.externalRootDirectory + 'icollect/avatar/' +  id + '.jpg';
        }).catch((err) => { this.avatar = 'assets/imgs/user.png'; });
      },(error) => { this.avatar = 'assets/imgs/user.png'; });
    },(error) => { this.avatar = 'assets/imgs/user.png'; });

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => { 
      db.executeSql('SELECT coordx, coordy FROM contacts WHERE id_contact ='+id, {})
      .then(res => { 

        if (this.network.type == 'none' ) {
          console.log('Offline');
          let toast = this.toastCtrl.create({
            message: 'Please check your internet connection',
            duration: 3000,
            position: 'bottom'
          });
        
          toast.onDidDismiss(() => {
            console.log('Dismissed toast');
          });
        
          toast.present();
          return; 
    
        } else {
          this.addMap(res.rows.item(0).coordx,res.rows.item(0).coordy);
        }
        
      }).catch(e => { console.log(e) });
    }).catch(e => console.log(e));
  }

  addMap(lat,long){ 
    let latLng = new google.maps.LatLng(lat, long);

    let mapOptions = {
      center: latLng,
      zoom: 11,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.addMarker();
  }

  addMarker(){ 
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<p>Home location</p>";          
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  getUserPosition(){
    this.options = {
      enableHighAccuracy : true
    };

    this.geolocation.getCurrentPosition(this.options).then((pos : Geoposition) => {

        this.currentPos = pos;      
        console.log(pos);

    },(err : PositionError)=>{
        console.log("error : " + err.message);
    });
  }

  plantations() {
    let id = this.navParams.get('id_contact');
    let name = this.navParams.get('name');
    let town_name = this.navParams.get('town_name');
    let id_primary_company = this.navParams.get('id_primary_company');

    let data = {
      id_contact : id,
      name: name,
      town_name: town_name,
      id_primary_company: id_primary_company
    };

    this.navCtrl.push(PlantationsPage, data);
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