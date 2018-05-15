import { Component, ViewChild, ElementRef } from '@angular/core';
import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';
import { ToastController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation';

import { PlantationDetailsPage } from '../plantation-details/plantation-details';

declare var window;
declare var google;

@IonicPage()
@Component({
  selector: 'page-collection-point',
  templateUrl: 'collection-point.html',
})
export class CollectionPointPage {
  public avatar: string;
  contactName;
  townName;

  options : GeolocationOptions;
  currentPos : Geoposition;

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  constructor(public navCtrl: NavController, 
    public file: File,
    public sqlite: SQLite,
    private geolocation : Geolocation,
    public toastCtrl: ToastController,
    public network: Network,
    public navParams: NavParams
  ) {
  }

  ionViewDidLoad() {
    this.contactName = this.navParams.get('name'); 
    this.townName = this.navParams.get('town_name'); 
    let id_contact = this.navParams.get('id_contact');
    let id_plantation = this.navParams.get('id_plantation');

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
      db.executeSql('SELECT coordx, coordy FROM plantation WHERE id_plantation ='+id_plantation, {})
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
          if((res.rows.item(0).coordx===undefined)||(res.rows.item(0).coordx==="")){
            this.geolocation.getCurrentPosition().then((data) => {
              this.addMap(data.coords.latitude,data.coords.longitude,1);

              let toast = this.toastCtrl.create({
                message: 'Collection point not stored',
                duration: 3000,
                position: 'bottom'
              });
            
              toast.onDidDismiss(() => {
                console.log('Dismissed toast');
              });
            
              toast.present();

            }).catch((error) => {
              console.log('Error getting location'+ error);
            });
          } else {
            this.addMap(res.rows.item(0).coordx,res.rows.item(0).coordy,0);
          }
        }

      }).catch(e => { console.log(e) });
    }).catch(e => console.log(e));
  }

  addMap(lat,long,conf){
    let latLng = new google.maps.LatLng(lat, long);

    let mapOptions = {
      center: latLng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.HYBRID
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.addMarker(conf);
  }

  addMarker(conf){ 
    let content;
    let marker = new google.maps.Marker({
    map: this.map,
    animation: google.maps.Animation.DROP,
    position: this.map.getCenter()
    });

    if(conf == 1){
      content = "<p>This is your current location</p>";   
    } else {
      content = "<p>This is your collection point</p>"; 
    }
             
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

  plantationDetail() { 
    let id_plantation = this.navParams.get('id_plantation');
    let id_contact = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('town_name');
    let name = this.navParams.get('name');
    let id_primary_company = this.navParams.get('id_primary_company'); 

    let data = {
      id_plantation : id_plantation,
      name: name,
      logged_id : logged_id,
      logged_name : logged_name,
      name_town: town_name,
      id_primary_company: id_primary_company,
      id_contact: id_contact,
      company_name : company
    };

    this.navCtrl.push(PlantationDetailsPage, data);
  }

}
