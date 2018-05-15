import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, LoadingController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Http } from "@angular/http";
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { ToastController } from 'ionic-angular'; 

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout'; 

import { ContactDetailsPage } from '../contact-details/contact-details';

declare var window;

@IonicPage()
@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html',
})
export class ContactsPage {
  searchTerm: string = '';
  // public photoLink: string;
  public avatar: string;
  public contacts:any = [];

  loggedIdContact;
  FullName;
  Company;

  loading;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public app: App, 
    public http: Http, 
    public file: File,
    public sqlite: SQLite, 
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController
  ){ 
    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('icollect', {create: true, exclusive: false}, (directory) => {
        console.log('iCollect directory created');
      });
    });

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('icollect/avatar', {create: true, exclusive: false}, (directory) => {
        console.log('avatar directory created');
      });
    });
  }

  ionViewDidLoad() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    this.loading.present();
    this.getContactsData();
  }

  getItems(searchbar) {
    // set q to the value of the searchbar
    var q = searchbar.srcElement.value;

    // if the value is an empty string don't filter the items
    if (!q) {
      this.getContactsData();
      //return;
    }
  
    this.contacts = this.contacts.filter((v) => {
      if(v.name && q) {
        if (v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  getContactsData() {   
    this.Company = this.navParams.get('company_name'); 
    this.FullName = this.navParams.get('logged_name');
    let logged_id = this.navParams.get('logged_id');

    this.file.checkFile(this.file.externalRootDirectory + 'icollect/avatar/', logged_id + '.jpg').then((files) => { 
      this.avatar = this.file.externalRootDirectory + 'icollect/avatar/' +  logged_id + '.jpg';
    }).catch((err) => { this.avatar = 'assets/imgs/user.png'; } );

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT id_contact, name, town_name FROM contacts ORDER BY name ASC', {}) 
      .then(res => { 

        let n:number = res.rows.length;
     
        for(let i=0; i<n; i++){ 
          let filepath = this.file.externalRootDirectory + 'icollect/avatar/';
          let filename = res.rows.item(i).id_contact + '.jpg';  
                
          this.file.checkFile(filepath,filename).then((files) => { 
            this.contacts.push({ id_contact : res.rows.item(i).id_contact, name : res.rows.item(i).name, town_name : res.rows.item(i).town_name, photo: filepath + filename, logged_id: logged_id }); 
          }).catch((err) => {
            this.contacts.push({ id_contact : res.rows.item(i).id_contact, name : res.rows.item(i).name, town_name : res.rows.item(i).town_name, photo: 'assets/imgs/user.png', logged_id: logged_id }); 
          });
        } 

        this.loading.dismiss(); 

      }).catch(e => { 
        
        let toast = this.toastCtrl.create({
          message: 'No contact stored',
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

  
  itemContact(item) { 
    let id_primary_company = this.navParams.get('id_primary_company');
    let company = this.navParams.get('company_name');
    let logged_id = this.navParams.get('logged_id');
    let logged_name = this.navParams.get('logged_name');

    let data = {
      logged_id: logged_id,
      logged_name: logged_name,
      id_contact: item.id_contact,
      name: item.name,
      town_name: item.town_name,
      id_primary_company: id_primary_company,
      company_name: company
    };
    this.app.getRootNav().push(ContactDetailsPage, data);
  }

  contactDetail() {
    let id_contact = this.navParams.get('logged_id');

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT town_name, name FROM contacts WHERE id_contact ='+id_contact, {})
      .then(res => { 
        let logged_name = this.navParams.get('logged_name');
        let company = this.navParams.get('company_name');
        let id_primary_company = this.navParams.get('id_primary_company'); 
        
        let data = {
          logged_id: id_contact,
          id_contact: id_contact,
          logged_name: logged_name,
          name: res.rows.item(0).name,
          town_name: res.rows.item(0).town_name,
          id_primary_company: id_primary_company,
          company_name: company
        };
        
        this.app.getRootNav().push(ContactDetailsPage, data);

      }).catch(e => { console.log(e) });
    }).catch(e => console.log(e));
  }

  logout(){
    const root = this.app.getRootNav();
    root.popToRoot();
  }

}
