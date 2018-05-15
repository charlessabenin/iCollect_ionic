import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';
import { ToastController } from 'ionic-angular';

declare var window;
declare var google;

@IonicPage()
@Component({
  selector: 'page-show-plantation-surface',
  templateUrl: 'show-plantation-surface.html',
})
export class ShowPlantationSurfacePage {

  public avatar: string;
  contactName;
  townName;
  area_acres;
  surface_ha;
  json;

  @ViewChild('plantation') mapElement: ElementRef;
  map: any;

  constructor(public navCtrl: NavController, 
    public file: File,
    public sqlite: SQLite,
    public network: Network,
    public toastCtrl: ToastController,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.contactName = this.navParams.get('name'); 
    this.townName = this.navParams.get('town_name'); 
    let id_contact = this.navParams.get('id_contact');

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('icollect/avatar', {create: false}, (directory) => {  
        this.file.checkFile(this.file.externalRootDirectory + 'icollect/avatar/', id_contact + '.jpg').then((files) => { 
          this.avatar = this.file.externalRootDirectory + 'icollect/avatar/' +  id_contact + '.jpg';
        }).catch((err) => {this.avatar = 'assets/imgs/user.png';});
      },(error) => {this.avatar = 'assets/imgs/user.png'; });
    },(error) => { this.avatar = 'assets/imgs/user.png'; });


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
      this.addMap();
    }
    
  }

  addMap(){ 
    let id_plantation = this.navParams.get('id_plantation');

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => { 
      db.executeSql('SELECT geo_json, coordx, coordy, area_acres, surface_ha FROM plantation WHERE id_plantation ='+id_plantation, {})
      .then(res => { 
        this.area_acres = "Acres: " + res.rows.item(0).area_acres.toFixed(2);
        this.surface_ha = "Hectres: " + res.rows.item(0).surface_ha.toFixed(2);

        let json = JSON.parse(res.rows.item(0).geo_json);

        var savedPolygon = [];

        var coords = json.features[0].geometry.coordinates[0];

        coords.forEach(function(entry){
          savedPolygon.push(new google.maps.LatLng(entry[1],entry[0]));
        });

        // Construct the polygon.
        var plantationPoly = new google.maps.Polygon({
          paths: savedPolygon,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35
        });


        var lowx,
        highx,
        lowy,
        highy,
        lats = [],
        lngs = [],
        vertices = plantationPoly.getPath();

        for(var i=0; i<vertices.length; i++) {
          lngs.push(vertices.getAt(i).lng());
          lats.push(vertices.getAt(i).lat());
        }

        lats.sort();
        lngs.sort();
        lowx = lats[0];
        highx = lats[vertices.length - 1];
        lowy = lngs[0];
        highy = lngs[vertices.length - 1];
        let center_x = lowx + ((highx-lowx) / 2);  
        let center_y = lowy + ((highy - lowy) / 2);  


        let latLng = new google.maps.LatLng(center_x, center_y);

        let mapOptions = {
          center: latLng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.HYBRID
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);   

        // show polygon
        plantationPoly.setMap(this.map);

      }).catch(e => { console.log(e) });
    }).catch(e => console.log(e));
  }

  plantationDetail(){
    this.navCtrl.pop();
  }

}
