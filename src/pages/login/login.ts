import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
import { ToastController } from 'ionic-angular'; 
import { Http } from "@angular/http";

import { ContactsPage } from '../contacts/contacts';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  email;
  password;
  logged_id;
  id_primary_company;
  id_user_supchain_type;

  loading;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public http: Http, 
    private sqlite: SQLite, 
    public network: Network, 
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController
  ) {
    
  }


  databases() {
    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => { 
      // Create ticker table if not exist
      db.executeSql('CREATE TABLE IF NOT EXISTS mobcrmticker (id_mobconticker INTEGER PRIMARY KEY ASC, agent_id INTEGER, contact_id INTEGER, plantation_id INTEGER, field_name TEXT, field_value TEXT, field_table TEXT, ticker_time TEXT, coordx REAL, coordy REAL, sync INTEGER)', {})
      .then(res => { console.log(res); }).catch(e => console.log(e));
     
      // Create registervalues table if not exist
      db.executeSql('CREATE TABLE IF NOT EXISTS registervalues (id_regvalue INTEGER PRIMARY KEY ASC, id_register INTEGER, regname TEXT, regcode TEXT, nvalue TEXT, cvalue TEXT, cvaluede TEXT, cvaluefr TEXT, cvaluept TEXT, cvaluees TEXT, dvalue TEXT)', {})
      .then(res => { console.log(res); }).catch(e => console.log(e));
   
      // Create Contact_docs table if not exist
      db.executeSql('CREATE TABLE IF NOT EXISTS contact_docs(id_doc INTEGER PRIMARY KEY ASC, id_contact INTEGER, doc_type INTEGER, doc_date TEXT, filename TEXT, description TEXT)', {})
      .then(res => { console.log(res); }).catch(e => console.log(e));
  
      // Create Contacts table if not exist
      db.executeSql('CREATE TABLE IF NOT EXISTS contacts(id_contact INTEGER PRIMARY KEY ASC, firstname TEXT, lastname TEXT, middlename TEXT, name TEXT, state TEXT, district TEXT, coordx REAL, coordy REAL, id_gender INTEGER, birth_date TEXT, national_lang TEXT, p_phone TEXT, p_phone2 TEXT, p_phone3 TEXT, p_phone4 TEXT, p_email TEXT, p_email2 TEXT, p_email3 TEXT, notes TEXT, id_type INTEGER, id_supchain_type INTEGER, id_title INTEGER, id_coop_member INTEGER, id_coop_member_no INTEGER, id_cooperative INTEGER, town_name TEXT, p_street1 TEXT, photo TEXT)', {})
      .then(res => { console.log(res); }).catch(e => console.log(e));
  
      // Create plantation table if not exist
      db.executeSql('CREATE TABLE IF NOT EXISTS plantation (id_plantation INTEGER PRIMARY KEY ASC, plantationsite_id INTEGER, id_contact INTEGER, id_town INTEGER, name_town TEXT, property INTEGER, coordx REAL, coordy REAL, geo_json TEXT, year_creation INTEGER, titledeed TEXT, notes TEXT, area_acres REAL, surface_ha REAL, code_plantation TEXT)', {})
      .then(res => { console.log(res); }).catch(e => console.log(e));

      // Create plantation_docs table if not exist
      db.executeSql('CREATE TABLE IF NOT EXISTS plantation_docs (id_doc INTEGER PRIMARY KEY ASC, id_plantation INTEGER, doc_date TEXT, filename TEXT)', {})
      .then(res => { console.log(res); }).catch(e => console.log(e));

      // Create Users table if not exist
      db.executeSql('CREATE TABLE IF NOT EXISTS users (id_contact INTEGER PRIMARY KEY ASC, id_primary_company INTEGER, id_user_supchain_type INTEGER, company_name TEXT, username TEXT, password TEXT, name TEXT)', {})
      .then(res => { console.log(res); }).catch(e => console.log(e));
     
      db.executeSql("SELECT username, password, id_contact, id_primary_company, id_user_supchain_type FROM users ORDER BY id_contact DESC LIMIT 1", {})
      .then(res => {  
        if(res.rows.length !== 0){  
          this.email = res.rows.item(0).username;
          this.password = res.rows.item(0).password;
          this.logged_id = res.rows.item(0).id_contact;
          this.id_primary_company = res.rows.item(0).id_primary_company;
          this.id_user_supchain_type = res.rows.item(0).id_user_supchain_type;
        } 
      }).catch(e => { 
        console.log(e)
      });
    }).catch(e => console.log(e)); 
  }

  restFetchPlantation(){ 
    return new Promise((resolve,reject)=>{
      let id_primary_company = this.id_primary_company;
      let id_contact = this.logged_id;
      
      let v_plantation = 'http://idiscover.ch/api/restifydb/postgres/v_new_plantation/?_start=0&_count=50&_expand=yes&_view=json&_filter=id_contact%3D%3D'+id_contact+'||id_primary_company%3D%3D'+id_primary_company;
      let timeoutMS = 10000;
        
      this.http.get(v_plantation)
      .timeout(timeoutMS)
      .map(res => res.json()).subscribe(data => {
        let r = data;
        console.log(r);

        let n:number = JSON.parse(r.restify.rowCount);
      
        if(n!=0){
          for(let i=0; i <= n; i++){ 

            let id_plantation = JSON.stringify(r.restify.rows[i].values.id_plantation.value);  
            let plantationsite_id = JSON.stringify(r.restify.rows[i].values.plantationsite_id.value);    
            let id_contact = JSON.stringify(r.restify.rows[i].values.id_contact.value);   
            let id_town = JSON.stringify(r.restify.rows[i].values.id_town.value);   
            let name_town = JSON.stringify(r.restify.rows[i].values.name_town.value);   
            let coordx = JSON.stringify(r.restify.rows[i].values.coordx.value);     
            let coordy = JSON.stringify(r.restify.rows[i].values.coordy.value);  
            let year_creation = JSON.stringify(r.restify.rows[i].values.year_creation.value);  
            let titledeed = JSON.stringify(r.restify.rows[i].values.statut.value);  
            let notes = JSON.stringify(r.restify.rows[i].values.notes.value);  
            let area_acres = JSON.stringify(r.restify.rows[i].values.area_acres.value); 
            let surface_ha = JSON.stringify(r.restify.rows[i].values.surface_ha.value);
            //let code_plantation = JSON.stringify(r.restify.rows[i].values.code_plantation.value);
          
            this.sqlite.create({
              name: 'icollect.db',
              location: 'default'
            }).then((db: SQLiteObject) => {   
              db.executeSql('INSERT INTO plantation (id_plantation, plantationsite_id, id_contact, id_town, name_town, coordx, coordy, year_creation, titledeed, notes, area_acres, surface_ha) VALUES ('+id_plantation+','+plantationsite_id+', '+id_contact+', '+id_town+', '+name_town+', '+coordx+', '+coordy+', '+year_creation+', '+titledeed+', '+notes+', '+area_acres+', '+surface_ha+')', {})
              .then(res => { console.log(res) }).catch(e => { console.log(e) });
  
            }).catch(e => { 
              reject();
              console.log(e)
            });
          }
        }
        resolve();
      },
      err => {                    
        console.log('encountered an error');
        reject();
      });
    });
  }


  restFetchContact(){   
    return new Promise((resolve,reject)=>{
      let v_contact;
      let v_contact_start;
      let lenth:number;

      let id_contact = this.logged_id;
      let id_primary_company = this.id_primary_company;
      let id_user_supchain_type = this.id_user_supchain_type;  

      if(id_primary_company!=""){
        v_contact_start = 'https://idiscover.ch/api/restifydb/postgres/v_new_contact/?_start=0&_count=50&_expand=yes&_view=json&_filter=id_cooperative%3D%3D'+id_primary_company+'||id_primary_company%3D%3D'+id_primary_company;
      } else
      if(id_user_supchain_type==115){
        v_contact_start = 'https://idiscover.ch/api/restifydb/postgres/v_new_contact/?_start=0&_count=50&_expand=yes&_view=json&_filter=id_contact%3D%3D'+id_contact+'||id_primary_company%3D%3D'+id_primary_company;
      }
      
      this.http.get(v_contact_start)
      .timeout(10000)
      .map(res => res.json()).subscribe(data => {  
        lenth = JSON.parse(data.restify.rowCount);    
      
        let x = 0;
        while (x <= lenth) {
          let start = x;    

          if(id_primary_company!=""){
            v_contact = 'https://idiscover.ch/api/restifydb/postgres/v_new_contact/?_start='+start+'&_count=50&_expand=yes&_view=json&_filter=id_cooperative%3D%3D'+id_primary_company+'||id_primary_company%3D%3D'+id_primary_company;
          } else
          if(id_user_supchain_type==115){
            v_contact = 'https://idiscover.ch/api/restifydb/postgres/v_new_contact/?_start='+start+'&_count=50&_expand=yes&_view=json&_filter=id_contact%3D%3D'+id_contact+'||id_primary_company%3D%3D'+id_primary_company;
          }

          let timeoutMS = 10000;
        
          this.http.get(v_contact)
          .timeout(timeoutMS)
          .map(res => res.json()).subscribe(data => {
            let r = data;
            console.log(r);

            let n:number = JSON.parse(r.restify.rowCount); 

            for(let i=0; i <= n; i++){ 
              let id_contact = JSON.stringify(r.restify.rows[i].values.id_contact.value);   
              let firstname = JSON.stringify(r.restify.rows[i].values.firstname.value);  
              let lastname = JSON.stringify(r.restify.rows[i].values.lastname.value);  
              let middlename = JSON.stringify(r.restify.rows[i].values.middlename.value);  
              let name = JSON.stringify(r.restify.rows[i].values.name.value);  
              let state = JSON.stringify(r.restify.rows[i].values.state.value); 
              let district = JSON.stringify(r.restify.rows[i].values.district.value); 
              let coordx = JSON.stringify(r.restify.rows[i].values.coordx.value);  
              let coordy = JSON.stringify(r.restify.rows[i].values.coordy.value);   
              let id_gender = JSON.stringify(r.restify.rows[i].values.id_gender.value);   
              let birth_date = JSON.stringify(r.restify.rows[i].values.birth_date.value);   
              let national_lang = JSON.stringify(r.restify.rows[i].values.national_lang.value);  
              let p_phone = JSON.stringify(r.restify.rows[i].values.p_phone.value);   
              let p_phone2 = JSON.stringify(r.restify.rows[i].values.p_phone2.value);  
              let p_phone3 = JSON.stringify(r.restify.rows[i].values.p_phone3.value);   
              let p_phone4 = JSON.stringify(r.restify.rows[i].values.p_phone4.value);  
              let p_email = JSON.stringify(r.restify.rows[i].values.p_email.value);   
              let p_email2 = JSON.stringify(r.restify.rows[i].values.p_email2.value);  
              let p_email3 = JSON.stringify(r.restify.rows[i].values.p_email3.value);  
              let notes = JSON.stringify(r.restify.rows[i].values.notes.value);   
              let id_type = JSON.stringify(r.restify.rows[i].values.id_type.value);  
              let id_supchain_type = JSON.stringify(r.restify.rows[i].values.id_supchain_type.value);   
              let id_title = JSON.stringify(r.restify.rows[i].values.id_title.value);   
              let id_coop_member = JSON.stringify(r.restify.rows[i].values.id_coop_member.value);   
              let id_cooperative = JSON.stringify(r.restify.rows[i].values.id_cooperative.value);   
              let id_coop_member_no = JSON.stringify(r.restify.rows[i].values.id_coop_member_no.value);  
              let town_name = JSON.stringify(r.restify.rows[i].values.town_name.value);  
              let p_street1 = JSON.stringify(r.restify.rows[i].values.p_street1.value);   
            
              this.sqlite.create({
                name: 'icollect.db',
                location: 'default'
              }).then((db: SQLiteObject) => {
                db.executeSql('INSERT INTO contacts (id_contact, firstname, lastname, middlename, name, state, district, coordx, coordy, id_gender, birth_date, national_lang, p_phone, p_phone2, p_phone3, p_phone4, p_email, p_email2, p_email3, notes, id_type, id_supchain_type, id_title, id_coop_member, id_coop_member_no, id_cooperative, town_name, p_street1) VALUES ('+id_contact+', '+firstname+','+lastname+', '+middlename+', '+name+', '+state+', '+district+', '+coordx+', '+coordy+', '+id_gender+', '+birth_date+', '+national_lang+', '+p_phone+', '+p_phone2+', '+p_phone3+', '+p_phone4+', '+p_email+', '+p_email2+', '+p_email3+', '+notes+', '+id_type+', '+id_supchain_type+', '+id_title+', '+id_coop_member+', '+id_coop_member_no+', '+id_cooperative+', '+town_name+', '+p_street1+')', {})
                .then(res => { console.log(res); }).catch(e => { console.log(e); });

              }).catch(e =>{ console.log(e); });
            }

          }, err => { console.log(err); });

          x=x+50;
        }
        
        resolve();

      }, err => {  
        console.log('encountered an error');
        reject();
      });
    });
  }


  restFetchRegvalues() { 
    return new Promise((resolve,reject)=>{
      let lenth:number;
      let v_regvalues_start = 'https://idiscover.ch/api/restifydb/postgres/v_regvalues/?_start=0&_count=50&_expand=yes&_view=json';
      
      this.http.get(v_regvalues_start)
      .timeout(10000)
      .map(res => res.json()).subscribe(data => {  
        lenth = JSON.parse(data.restify.rowCount);    

        let x = 0;
        while (x <= lenth) {
          let start = x;    

          let v_regvalues = 'https://idiscover.ch/api/restifydb/postgres/v_regvalues/?_start='+start+'&_count=50&_expand=yes&_view=json';
          let timeoutMS = 10000;
        
          this.http.get(v_regvalues)
          .timeout(timeoutMS)
          .map(res => res.json()).subscribe(data => {
            let r = data;
            console.log(r);

            let n:number = JSON.parse(r.restify.rowCount); 

            for(let i=0; i <= n; i++){   
              let id_regvalue = JSON.stringify(r.restify.rows[i].values.id_regvalue.value); 
              let id_register = JSON.stringify(r.restify.rows[i].values.id_register.value); 
              let regname = JSON.stringify(r.restify.rows[i].values.regname.value); 
              let regcode = JSON.stringify(r.restify.rows[i].values.regcode.value); 
              let nvalue = JSON.stringify(r.restify.rows[i].values.nvalue.value); 
              let cvalue = JSON.stringify(r.restify.rows[i].values.cvalue.value);
              let cvaluede = JSON.stringify(r.restify.rows[i].values.cvaluede.value); 
              let cvaluefr = JSON.stringify(r.restify.rows[i].values.cvaluefr.value); 
              let cvaluept = JSON.stringify(r.restify.rows[i].values.cvaluept.value);
              let cvaluees = JSON.stringify(r.restify.rows[i].values.cvaluees.value); 
              let dvalue = JSON.stringify(r.restify.rows[i].values.dvalue.value);
              
              this.sqlite.create({
                name: 'icollect.db',
                location: 'default'
              }).then((db: SQLiteObject) => {
                db.executeSql('INSERT INTO registervalues (id_regvalue, id_register, regname, regcode, nvalue, cvalue, cvaluede, cvaluefr, cvaluept, cvaluees, dvalue) VALUES ('+id_regvalue+', '+id_register+', '+regname+', '+regcode+', '+nvalue+', '+cvalue+', '+cvaluede+', '+cvaluefr+', '+cvaluept+', '+cvaluees+', '+dvalue+')', {})
                .then(res => { console.log(res); }).catch(e => { console.log(e); });

              }).catch(e =>{ console.log(e); });
            }

          }, err => { console.log(err); });

          x=x+50;
        }
        
        resolve();

      }, err => {  
        console.log('encountered an error');
        reject();
      });

    });
  }


  restFetchUser(userName,passWord) { 
    return new Promise((resolve,reject)=>{
      if (this.network.type == 'none' ) {
        console.log('Offline');
        let toast = this.toastCtrl.create({
          message: 'No data stored, please connect to internet',
          duration: 3000,
          position: 'bottom'
        });
      
        toast.onDidDismiss(() => {
          console.log('Dismissed toast');
        });
      
        toast.present();
        reject(); 
  
      } else {    
  
        let v_security_new = 'https://idiscover.ch/api/restifydb/postgres/v_security_mobile/?_start=0&_count=50&_expand=yes&_view=json&_filter=username%3D%3D'+userName;
       
        this.http.get(v_security_new)
        .map(res => res.json()).subscribe(data => {  
          let r = data;
          console.log(r);  
  
          let n:number = JSON.parse(r.restify.rowCount);    
  
          for(let i=0; i < n; i++){  
            let u_id_contact = JSON.stringify(r.restify.rows[i].values.id_contact.value);   
            let u_id_primary_company = JSON.stringify(r.restify.rows[i].values.id_primary_company.value); 
            let u_id_user_supchain_type = JSON.stringify(r.restify.rows[i].values.id_user_supchain_type.value);   
            let company_name = JSON.stringify(r.restify.rows[i].values.company_name.value);  
            let username = JSON.stringify(r.restify.rows[i].values.username.value);   
            let password = JSON.stringify(r.restify.rows[i].values.password.value);  
            let name = JSON.stringify(r.restify.rows[i].values.name.value);    
          
            this.sqlite.create({  
              name: 'icollect.db',
              location: 'default'
            }).then((db: SQLiteObject) => { 
              db.executeSql('INSERT INTO users (id_contact, id_primary_company, id_user_supchain_type, company_name, username, password, name) VALUES ('+u_id_contact+', '+u_id_primary_company+', '+u_id_user_supchain_type+', '+company_name+', '+username+', '+password+', '+name+')',{})
              .then(res => { 
                console.log(res); 
                this.logged_id = u_id_contact.replace(/['"]+/g, '');
                this.id_primary_company = u_id_primary_company.replace(/['"]+/g, '');
                this.id_user_supchain_type = u_id_user_supchain_type.replace(/['"]+/g, '');
                resolve();
  
              }).catch(e =>{ 
                console.log(e); 
                reject(); 
              });
            }).catch(e =>{ console.log(e); }); 
          }
    
        },
        err => {                    
          console.log('encountered an error');
        }); 
      } 
    });
  }


  login() { 
    this.databases();
    let username = this.email;
    let password = this.password;

    if(username === ""){
      this.presentToast("Username field is empty");
      return;
    } else 
    if(password === ""){
      this.presentToast("Password field is empty");
      return;
    } else
    if((username!=="")&&(password!=="")){
      this.checkLogin(username,password); 
    } else {
      this.presentToast("Enter username or password");
      return;
    }
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

  checkLogin(username,password) {  
    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => { 
      db.executeSql("SELECT id_contact, name, id_primary_company, company_name, id_user_supchain_type FROM users WHERE username='"+username+"' AND password='"+password+"'", {})
      .then(res => {    
        let data = {
          logged_id : res.rows.item(0).id_contact,
          logged_name : res.rows.item(0).name,
          id_primary_company : res.rows.item(0).id_primary_company,
          id_user_supchain_type : res.rows.item(0).id_user_supchain_type,
          company_name : res.rows.item(0).company_name
        }; 
        this.loading.dismiss();
        this.navCtrl.push(ContactsPage, data); 

      }).catch(e => {  

        this.loading = this.loadingCtrl.create({
          content: 'Fetching data...'
        });
    
        this.loading.present();

        this.restFetchUser(username,password).then(
          (val)=> { 
            this.restFetchContact().then(
              (val)=> { 
                this.restFetchPlantation().then(
                  (val)=> { 
                    this.restFetchRegvalues().then(
                      (val)=> { this.checkLogin(username,password); },
                      (err)=> { this.loading.dismiss(); }
                    );
                  },
                  (err)=> {  
                    let toast = this.toastCtrl.create({
                      message: 'No plantation assign to your login, please contact the administrator',
                      duration: 5000,
                      position: 'bottom'
                    });
                  
                    toast.onDidDismiss(() => {
                      console.log('Dismissed toast');
                    });
                  
                    toast.present();
                    this.loading.dismiss();
                    this.checkLogin(username,password);  
                  }
                );
              },
              (err)=> {  
                let toast = this.toastCtrl.create({
                  message: 'No contact assign to your login, please contact the administrator',
                  duration: 5000,
                  position: 'bottom'
                });
              
                toast.onDidDismiss(() => {
                  console.log('Dismissed toast');
                });
              
                toast.present();
                this.loading.dismiss(); 
                this.checkLogin(username,password);  
              }
            );
          },
          (err)=> {  
            let toast = this.toastCtrl.create({
              message: 'Login not in our system, please contact the administrator',
              duration: 5000,
              position: 'bottom'
            });
          
            toast.onDidDismiss(() => {
              console.log('Dismissed toast');
            });
          
            toast.present();
            this.loading.dismiss();  
          }
        );


      });

    }).catch(e => {
      console.log(e)
    });
  } 

}
