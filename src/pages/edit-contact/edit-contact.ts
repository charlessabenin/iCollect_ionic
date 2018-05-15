import { Component } from '@angular/core';
import { File } from '@ionic-native/file';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ViewController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Geolocation } from '@ionic-native/geolocation';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { BackgroundMode } from '@ionic-native/background-mode';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { ContactDetailsPage } from '../contact-details/contact-details';
import { NewDocumentPage } from '../new-document/new-document';

declare var window;

@IonicPage()
@Component({
  selector: 'page-edit-contact',
  templateUrl: 'edit-contact.html',
})
export class EditContactPage {

  public avatarURL: string;
  public avatar: string;

  genderList: any;
  languageList: any;

  id: any;
  p_phone;
  p_phone2;
  p_phone3;
  p_phone4;
  p_email;
  p_email2;
  p_email3;
  coordx;
  coordy;
  id_coop_member;
  id_coop_member_no;
  coopagent;
  state;
  district;
  town_name;
  p_street1;
  gender;
  birth_date;
  national_lang;
  notes;
  title;

  townName;
  contactName;
  myCustomUserService;

  constructor(private camera:Camera, 
    public navCtrl: NavController, 
    private geolocation: Geolocation, 
    public navParams: NavParams, 
    public view: ViewController, 
    public sqlite: SQLite, 
    public file: File,
    public http: Http,
    public loadingCtrl: LoadingController,
    private transfer: FileTransfer,
    public backgroundMode : BackgroundMode,
    public toastCtrl: ToastController
  ){

  }

  ionViewDidLoad() {
    let id = this.navParams.get('id_contact');

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0,
      (fileSys) => {
        fileSys.root.getDirectory('icollect/avatar', {create: false},
          (directory) => {  
            this.file.checkFile(this.file.externalRootDirectory + 'icollect/avatar/', id + '.jpg').then(
              (files) => { 
                this.avatar = this.file.externalRootDirectory + 'icollect/avatar/' +  id + '.jpg';
                this.avatarURL = this.file.externalRootDirectory + 'icollect/avatar/' +  id + '.jpg';
              }
            ).catch(
              (err) => {
                this.avatar = 'assets/imgs/user.png';
                this.avatarURL = 'assets/imgs/user.png';
              }
            );

          },
          (error) => { 
            this.avatar = 'assets/imgs/user.png';
            this.avatarURL = 'assets/imgs/user.png';
          });
      },
    (error) => { 
      this.avatar = 'assets/imgs/user.png';
      this.avatarURL = 'assets/imgs/user.png';
    });


    this.title = this.navParams.get('contactName'); 
    this.contactName = this.navParams.get('contactName'); 
    this.townName = this.navParams.get('town_name');

    this.getGenderList();
    this.getLanguageList();

    this.coordx = this.navParams.get('coordx');
    this.coordy = this.navParams.get('coordy');
    this.p_phone = this.navParams.get('p_phone');
    this.p_phone2 = this.navParams.get('p_phone2');
    this.p_phone3 = this.navParams.get('p_phone3');
    this.p_phone4 = this.navParams.get('p_phone4');
    this.p_email = this.navParams.get('p_email');
    this.p_email2 = this.navParams.get('p_email2');
    this.p_email3 = this.navParams.get('p_email3');
    this.id_coop_member = this.navParams.get('id_coop_member');
    this.id_coop_member_no = this.navParams.get('id_coop_member_no');
    this.coopagent = this.navParams.get('name');
    this.state = this.navParams.get('state');
    this.district = this.navParams.get('district');
    this.town_name = this.navParams.get('town_name');
    this.p_street1 = this.navParams.get('p_street1');
    this.gender = this.navParams.get('id_gender');
    this.birth_date = this.navParams.get('birth_date');
    this.national_lang = this.navParams.get('national_lang');
    this.notes = this.navParams.get('notes');
  }

  getGenderList() {
    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT id_regvalue, cvalue FROM registervalues WHERE id_register = 41', {})
      .then(res => { 
        this.genderList = [];
          for(let i=0; i<res.rows.length; i++){  
            this.genderList.push({ id_gender : res.rows.item(i).id_regvalue, gender_name : res.rows.item(i).cvalue });
          } 
      }).catch(e => {
        console.log(e)
      });
    }).catch(e => console.log(e));
  }

  getLanguageList() {
    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT id_regvalue, cvalue FROM registervalues WHERE id_register = 7', {})
      .then(res => { 
        this.languageList = [];
          for(let i=0; i<res.rows.length; i++){  
            this.languageList.push({ id_language : res.rows.item(i).id_regvalue, language_name : res.rows.item(i).cvalue });
          } 
      }).catch(e => {
        console.log(e) 
      });
    }).catch(e => console.log(e));
  }

  updateContact() {
    let id = this.navParams.get('id_contact'); 
    let logged_name = this.navParams.get('logged_name'); 
    let townName = this.navParams.get('town_name'); 
    let logged_id = this.navParams.get('logged_id');
    let company_name = this.navParams.get('company_name'); 
    let id_primary_company = this.navParams.get('id_primary_company'); 
    let name = this.navParams.get('contactName');

    let coordx = this.coordx;
    let coordy = this.coordy;
    let p_phone = this.p_phone;
    let p_phone2 = this.p_phone2;
    let p_phone3 = this.p_phone3;
    let p_phone4 = this.p_phone4;
    let p_email = this.p_email;
    let p_email2 = this.p_email2;
    let p_email3 = this.p_email3;
    let id_coop_member = this.id_coop_member;
    let id_coop_member_no = this.id_coop_member_no;
    let state = this.state;
    let district = this.district;
    let town_name = this.town_name; 
    let p_street1 = this.p_street1;
    let gender = this.gender;
    let birth_date = this.birth_date;
    let national_lang = this.national_lang;
    let notes = this.notes;

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("update contacts set p_phone='"+p_phone+"', p_phone2='"+p_phone2+"', p_phone3='"+p_phone3+"', p_phone4='"+p_phone4+"', p_email='"+p_email+"', p_email2='"+p_email2+"', p_email3='"+p_email3+"', id_coop_member='"+id_coop_member+"', id_coop_member_no='"+id_coop_member_no+"', state='"+state+"', district='"+district+"', town_name='"+town_name+"', p_street1='"+p_street1+"', id_gender='"+gender+"', birth_date='"+birth_date+"', national_lang='"+national_lang+"', notes='"+notes+"', coordx='"+coordx+"', coordy='"+coordy+"' WHERE id_contact = "+id,{})
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
            id_contact : id,
            name: name,
            logged_name: logged_name,
            company_name: company_name,
            logged_id: logged_id,
            town_name: townName,
            id_primary_company: id_primary_company
          };
          
          this.navCtrl.push(ContactDetailsPage, data);

        }, 2000);

      }).catch(e => {
        console.log(e)
      });

    }).catch(e => console.log(e));  
  } 

  options: CameraOptions = {
    quality: 100,
    targetWidth: 300,
    targetHeight: 300,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  ticker_update() { 
    if(this.coordx != this.navParams.get('coordx')){
      this.store_ticker('coordx',this.coordx);
    }

    if(this.coordy != this.navParams.get('coordy')){
      this.store_ticker('coordy',this.coordy);
    }

    if(this.p_phone != this.navParams.get('p_phone')){
      this.store_ticker('p_phone',this.p_phone);
    }

    if(this.p_phone2 != this.navParams.get('p_phone2')){
      this.store_ticker('p_phone2',this.p_phone2);
    }

    if(this.p_phone3 != this.navParams.get('p_phone3')){
      this.store_ticker('p_phone3',this.p_phone3);
    }

    if(this.p_phone4 != this.navParams.get('p_phone4')){
      this.store_ticker('p_phone4',this.p_phone4);
    }

    if(this.p_email != this.navParams.get('p_email')){
      this.store_ticker('p_email',this.p_email);
    }

    if(this.p_email2 != this.navParams.get('p_email2')){
      this.store_ticker('p_email2',this.p_email2);
    }

    if(this.p_email3 != this.navParams.get('p_email3')){
      this.store_ticker('p_email3',this.p_email3);
    }

    if(this.id_coop_member != this.navParams.get('id_coop_member')){
      this.store_ticker('id_coop_member',this.id_coop_member);
    }

    if(this.id_coop_member_no != this.navParams.get('id_coop_member_no')){
      this.store_ticker('id_coop_member_no',this.id_coop_member_no);
    }

    if(this.state != this.navParams.get('state')){
      this.store_ticker('state',this.state);
    }

    if(this.district != this.navParams.get('district')){
      this.store_ticker('district',this.district);
    }

    if(this.town_name != this.navParams.get('town_name')){
      this.store_ticker('town_name',this.town_name);
    }

    if(this.p_street1 != this.navParams.get('p_street1')){
      this.store_ticker('p_street1',this.p_street1);
    }

    if(this.gender != this.navParams.get('id_gender')){
      this.store_ticker('id_gender',this.gender);
    }

    if(this.birth_date != this.navParams.get('birth_date')){
      this.store_ticker('birth_date',this.birth_date);
    }

    if(this.national_lang != this.navParams.get('national_lang')){
      this.store_ticker('national_lang',this.national_lang);
    }

    if(this.notes != this.navParams.get('notes')){
      this.store_ticker('notes',this.notes);
    }
  }

  store_ticker(field_name,field_value){
    let id_contact = this.navParams.get('id_contact');
    let timestamp = new Date();

    this.geolocation.getCurrentPosition().then((data) => {

      this.sqlite.create({
        name: 'icollect.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        db.executeSql("INSERT INTO mobcrmticker (contact_id, field_name, field_value, field_table, ticker_time, coordx, coordy, sync) VALUES ('"+id_contact+"', '"+field_name+"', '"+field_value+"', 'contact', '"+timestamp+"', '"+data.coords.latitude+"', '"+data.coords.longitude+"', 0)",{})
        .then(res => { console.log(res); 

          let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded'});
          let options = new RequestOptions({ headers: headers });

          var link = 'https://idiscover.ch/api/restifydb/postgres/mobcrmticker/';
          var myData = JSON.stringify({id_contact:id_contact, field_name:field_name, field_value:field_value, field_table:'contact', ticker_time:timestamp, coordx:data.coords.latitude, coordy:data.coords.longitude, sync:1});
      
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

  getAvatar() {
    let id_contact = this.navParams.get('id_contact');

    this.camera.getPicture(this.options).then(
      (imagePath) => {
          // Create a new file name by using the username or something like that
          let newFileName = id_contact + ".jpg";
     
          // Returns a reference to the actual file located at imagePath
          window.resolveLocalFileSystemURL(imagePath,
          (file) => {
     
              // Returns a reference to the file system
              window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0,
              (fileSys) => {
     
                  // Gets a reference to your app directory, and if it doesn't exist it creates it
                  fileSys.root.getDirectory('icollect/avatar', {create: true, exclusive: false},
                  (directory) => {
     
                      // Moves the file to that directory, with its new name
                      file.moveTo(directory, newFileName,
                      // The file was succesfully moved and it returns a reference to it. We can use nativeURL to grab the
                      // path to the image on the device
                      (fileEntry) => {
                          this.myCustomUserService.SetProfilePhotoUrl(fileEntry.nativeURL);
                      },
     
                      // Now we start handing all the errors that could happen
                      (error) => {
                          // The file was unable to be moved
                          // Show error to the user
                          // ...
                      });
                  },
     
                  (error) => {
                      // Could not get a reference to your app folder
                      // Show error to the user
                      // ...
                  });
              },
     
              (error) => {
                  // Could not get a reference to the file system
                  // Show error to the user
                  // ...
              });
          });

          this.avatarURL = imagePath;
         // this.fileTransfert(id_contact);
      },
     
      (err) => {
           // Could not take picture
           // Show error to the user
           // ...
      });
  }


  fileTransfert(id_contact){
    this.backgroundMode.enable();
    this.backgroundMode.on("activate").subscribe(()=>{
      this.uploadFile(id_contact);
    });
  }

  uploadFile(id_contact) { 
    const fileTransfer: FileTransferObject = this.transfer.create();
  
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: id_contact + ".jpg",
      chunkedMode: false,
      mimeType: "multipart/form-data",
      headers: {}
    }
  
    fileTransfer.upload(this.avatarURL, 'https://idiscover.ch/mobile_upload.php', options)
      .then((data) => {
      console.log(data+" Uploaded Successfully");
      this.presentToast("Image uploaded successfully");
    }, (err) => {
      console.log(err);
      this.presentToast(JSON.stringify(err));
    });
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  getGeo() {
    this.geolocation.getCurrentPosition().then((data) => {
      this.coordx = data.coords.latitude;    
      this.coordy = data.coords.longitude; 

    }).catch((error) => {
      console.log('Error getting location'+ error);
    });
  }

  contactDetail() {
    let id = this.navParams.get('id_contact'); 
    let name = this.navParams.get('contactName');  
    let logged_id = this.navParams.get('logged_id');
    let townName = this.navParams.get('town_name'); 
    let company_name = this.navParams.get('company_name'); 
    let id_primary_company = this.navParams.get('id_primary_company'); 
    
    let data = {
      id_contact : id,
      name: name,
      logged_id: logged_id,
      town_name: townName,
      company_name: company_name,
      id_primary_company: id_primary_company
    };
    
    this.navCtrl.push(ContactDetailsPage, data);
  }


  docOptions: CameraOptions = {
    quality: 100,
    targetWidth: 596,
    targetHeight: 842,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  contactDocuments() {
    let id = this.navParams.get('id_contact'); 
    let name = this.navParams.get('contactName');  
    let logged_id = this.navParams.get('logged_id');
    let townName = this.navParams.get('town_name'); 
    let logged_name = this.navParams.get('logged_name');
    let company_name = this.navParams.get('company_name');
    let id_primary_company = this.navParams.get('id_primary_company'); 

    let data = {
      id_contact : id,
      name: name,
      logged_id: logged_id,
      town_name: townName,
      logged_name: logged_name,
      company_name: company_name,
      id_primary_company: id_primary_company
    };
    
    this.navCtrl.push(NewDocumentPage, data);
  }

  saveDocData(id_contact,filename) { 
    let date =  new Date().toISOString(); 

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("INSERT INTO contact_docs (id_contact, doc_date, filename) VALUES ("+id_contact+",'"+date+"','"+filename+"')", {})
      .then(res => { 
      }).catch(e => { console.log(e) });
    }).catch(e => console.log(e));


    let toast = this.toastCtrl.create({
      message: 'Document successfully saved',
      duration: 3000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  close(){
    this.view.dismiss();
  }

}
