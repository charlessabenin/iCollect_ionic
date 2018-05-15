import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Http, Headers, RequestOptions } from "@angular/http";
import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';
import { ToastController } from 'ionic-angular';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { EditPlantationPage } from '../edit-plantation/edit-plantation';

declare var window;
declare var google;

@IonicPage()
@Component({
  selector: 'page-plantation-surface',
  templateUrl: 'plantation-surface.html',
})
export class PlantationSurfacePage {

  @ViewChild('surfaceMap') mapElement: ElementRef;
  map: any;

  options : GeolocationOptions;
  currentPos : Geoposition;
  selectedShape: any;
  public avatar: string;
  contactName;
  townName;

  plantation;
  surface_ha;
  area_acres;
  locations = [];

  stored_geo_json;
  stored_surface_ha;
  stored_area_acres;

  save_plantation = false;
  save_location = false;
  add_location = false;

  constructor(public navCtrl: NavController,
    private geolocation : Geolocation, 
    private file : File,
    public http: Http,
    public sqlite: SQLite,
    public network: Network,
    public navParams: NavParams,
    public toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    this.contactName  = this.navParams.get('name'); 
    this.townName = this.navParams.get('name_town');
    let id = this.navParams.get('id_contact');
    let id_plantation = this.navParams.get('id_plantation');

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
      db.executeSql('SELECT coordx, coordy, geo_json, area_acres, surface_ha FROM plantation WHERE id_plantation ='+id_plantation, {})
      .then(res => { 
       
        if(res.rows.item(0).coordx!="" && res.rows.item(0).coordy!=""){

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

          this.stored_geo_json = res.rows.item(0).geo_json;
          this.stored_surface_ha = res.rows.item(0).surface_ha;
          this.stored_area_acres = res.rows.item(0).area_acres;

        } else {
          this.options = {
            enableHighAccuracy : true
          };
      
          this.geolocation.getCurrentPosition(this.options).then((pos : Geoposition) => {
            this.currentPos = pos;     
            console.log(pos);
      
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
              this.addMap(pos.coords.latitude,pos.coords.longitude); 
            }
      
          },(err : PositionError)=>{
            console.log("error : " + err.message);
          });
        }

      }).catch(e => { console.log(e) });
    }).catch(e => console.log(e));
  }

  addMap(lat,long){ 
    let latLng = new google.maps.LatLng(lat, long);

    let mapOptions = {
      center: latLng,
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.HYBRID
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  Draw() {
    //let id_plantation = this.navParams.get('id_plantation');
    document.getElementById("area").innerHTML = "";
    this.save_plantation = true;

    this.save_location = false;
    this.add_location = false;

    this.options = {
      enableHighAccuracy : true
    };

    this.geolocation.getCurrentPosition(this.options).then((pos : Geoposition) => {
      this.currentPos = pos;     
      console.log(pos);

      let latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.HYBRID
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.addMarker();

    },(err : PositionError)=>{
      console.log("error : " + err.message);
    });
  }

  addMarker(){ 
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<p>Your collection point</p>";          
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

    this.addDrawingTools();
  }

  addDrawingTools() { 
 
    var polyOptions = {
      strokeWeight: 0,
      fillOpacity: 0.45,
      editable: true
    };

    var newShape;
    var drawingManager;

    drawingManager = new google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON,   
        ]
      },
      polygonOptions: polyOptions,
      map: this.map
    });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', (e) => {
      
      this.selectedShape=e.overlay  

      if (e.type != google.maps.drawing.OverlayType.MARKER) {
        // Switch back to non-drawing mode after drawing a shape.
        drawingManager.setDrawingMode(null);

        // Add an event listener that selects the newly-drawn shape when the user
        // mouses down on it.
        newShape = e.overlay;  
        newShape.type = e.type;

        google.maps.event.addListener(newShape, 'click', ()=> {
          this.setSelection(newShape); 
        });

        var area = google.maps.geometry.spherical.computeArea(newShape.getPath());
        document.getElementById("area").innerHTML = "Acres : " + (area*0.000247105381).toFixed(2) + " <br/> Hectares : " + (area*0.0001).toFixed(2);

        this.area_acres = area*0.000247105381;
        this.surface_ha = area*0.0001;

        () => {this.setSelection(newShape);}
      }

      var geoJson = {
        "type": "FeatureCollection",
        "features": []
      };
      var polylineFeature = {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            []
          ]
        },
        "crs":{"type":"name","properties":{"name":"EPSG:4326"}}
      };
      for (var i = 0; i < e.overlay.getPath().getLength(); i++) {
        var pt = e.overlay.getPath().getAt(i);
        polylineFeature.geometry.coordinates[0].push([
          pt.lng(), pt.lat()
        ]);
      }
      geoJson.features.push(polylineFeature);
      this.plantation = JSON.stringify(geoJson);
    });

    google.maps.event.addListener(this.map, 'click',  ()=>{this.clearSelection(newShape);});
    google.maps.event.addDomListener(document.getElementById('delete-button'), 'click',  ()=>{this.deleteSelectedShape();});
  }

  clearSelection = (shape): void => {

    if(shape) {
      shape.setEditable(false);
      shape = null;
      this.selectedShape=shape
    }
  }

  setSelection = (shape): void => { 

    this.clearSelection(shape);
    var shape = shape;
    this.selectedShape=shape;

    console.log(shape.getPath())

    shape.setEditable(true);
    google.maps.event.addListener(shape.getPath(), 'set_at', ()=>{this.calcar(shape)});
    google.maps.event.addListener(shape.getPath(), 'insert_at', ()=>{this.calcar(shape)});
  }

  calcar= (shape): void => {

    var shape = shape

    var area = google.maps.geometry.spherical.computeArea(shape.getPath());
    document.getElementById("area").innerHTML = "Area =" + area.toFixed(2);

    this.selectedShape=shape
  }

  deleteSelectedShape = (): void => {

    if (this.selectedShape) {
      this.selectedShape.setMap(null);
    }

    document.getElementById("area").innerHTML = "";
  }

  wayPoint() {
    //let id_plantation = this.navParams.get('id_plantation');
    document.getElementById("area").innerHTML = "";
    this.deleteSelectedShape();

    this.save_plantation = false;
    this.save_location = true;
    this.add_location = true;

    let marker, i;

    this.geolocation.getCurrentPosition(this.options).then((pos : Geoposition) => {
      this.currentPos = pos;     
      console.log(pos);

      let latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.HYBRID
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      for (i = 0; i < this.locations.length; i++) {  
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(this.locations[i][0], this.locations[i][1]),
          map: this.map
        });
      }

    },(err : PositionError)=>{
      console.log("error : " + err.message);
    });
  }

  addLocation() {
    this.geolocation.getCurrentPosition(this.options).then((pos : Geoposition) => {
      this.currentPos = pos;     
      console.log(pos);
      this.locations.push([pos.coords.latitude, pos.coords.longitude]);
      this.wayPoint();

    },(err : PositionError)=>{
      console.log("error : " + err.message);
    });
  }

  savePlantation() {
    let id_plantation = this.navParams.get('id_plantation'); 

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("update plantation set geo_json='"+this.plantation+"', area_acres='"+this.area_acres+"', surface_ha='"+this.surface_ha+"' WHERE id_plantation = "+id_plantation,{})
      .then(res => { 
        this.ticker_update();

        let toast = this.toastCtrl.create({
          message: 'Update successfully saved',
          duration: 3000,
          position: 'bottom'
        });
      
        toast.onDidDismiss(() => {
          console.log('Dismissed toast');
        });
      
        toast.present();

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

      }).catch(e => {
        console.log(e)
      });

    }).catch(e => console.log(e)); 
  }

  ticker_update() { 
    if(this.plantation != this.stored_geo_json){ 
      this.store_ticker('geo_json',this.plantation);
    }
/*
    if(this.area_acres != this.stored_area_acres){
      this.store_ticker('area_acres',this.area_acres);
    }

    if(this.surface_ha != this.stored_surface_ha){
      this.store_ticker('surface_ha',this.surface_ha);
    }*/
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

          if(field_name=='geo_json'){
            field_value = JSON.parse(field_value);
          }

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

  saveLocation() {

    let last_x, last_y;
    let coords = [];

    var geoJson = {
      "type": "FeatureCollection",
      "features": []
    };
    var polylineFeature = {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          []
        ]
      },
      "crs":{"type":"name","properties":{"name":"EPSG:4326"}}
    };
    for (var i = 0; i < this.locations.length; i++) {
      polylineFeature.geometry.coordinates[0].push([
        this.locations[i][0], this.locations[i][1]
      ]);

      coords.push({lat: this.locations[i][0], lng: this.locations[i][1] });

      last_x = this.locations[0][0];
      last_y = this.locations[0][1];
    }

    polylineFeature.geometry.coordinates[0].push([last_x,last_y]);
    coords.push({lat: last_x, lng: last_y });

    geoJson.features.push(polylineFeature); 
    this.plantation = JSON.stringify(geoJson);


    let locationShape = new google.maps.Polygon({ paths: coords });

    var area = google.maps.geometry.spherical.computeArea(locationShape.getPath());
    document.getElementById("area").innerHTML = "Acres : " + (area*0.000247105381).toFixed(2) + " <br/> Hectares : " + (area*0.0001).toFixed(2);

    this.area_acres = area*0.000247105381;
    this.surface_ha = area*0.0001;

    this.savePlantation();
  }

  editPlantation(){
    this.navCtrl.pop();
  }
  
}
