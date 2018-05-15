import { Component } from '@angular/core';
import { File } from '@ionic-native/file';
import { Http } from "@angular/http";
import { Network } from '@ionic-native/network';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
 
import { EditContactPage } from '../edit-contact/edit-contact';
import { PlantationsPage } from '../plantations/plantations';
import { ContactDocumentsPage } from '../contact-documents/contact-documents';
import { ContactsPage } from '../contacts/contacts';
import { HomeMapPage } from '../home-map/home-map';

declare var window;

@IonicPage()
@Component({
  selector: 'page-contact-details',
  templateUrl: 'contact-details.html',
})
export class ContactDetailsPage {

  public avatar: string;

  title;
  p_phone; 
  p_phone2;
  p_phone3;
  p_phone4;
  p_email1;
  p_email2; 
  p_email3;
  id_coop_member;
  id_coop_member_no;
  state;
  district;
  town_name;
  p_street1;
  gender;
  birth_date;
  national_lang;
  notes;

  p_phone_sync_yes = false; 
  p_phone_sync_no = false; 
  p_phone2_sync_yes = false;
  p_phone2_sync_no = false;
  p_phone3_sync_yes = false;
  p_phone3_sync_no = false;
  p_phone4_sync_yes = false;
  p_phone4_sync_no = false;
  p_email2_sync_yes = false;
  p_email2_sync_no = false;
  p_email1_sync_yes = false;
  p_email1_sync_no = false;
  p_email3_sync_yes = false;
  p_email3_sync_no = false;
  id_coop_member_no_sync_yes = false;
  id_coop_member_no_sync_no = false;
  town_name_sync_yes = false;
  town_name_sync_no = false;
  p_street1_sync_yes = false;
  p_street1_sync_no = false;
  gender_sync_yes = false;
  gender_sync_no = false;
  birth_date_sync_yes = false;
  birth_date_sync_no = false;
  national_lang_sync_yes = false;
  national_lang_sync_no = false;
  notes_sync_yes = false;
  notes_sync_no = false;

  contactName;
  townName;
  id_primary_company;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public file: File, 
    public http: Http,
    public network: Network,
    public sqlite: SQLite) {
  }

  ionViewDidLoad() {

    this.syncMobTicker().then(
      (val)=> { this.syncInfo(); }
    );

    let id = this.navParams.get('id_contact');  
    let Email1;
    let CoopStored;

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('icollect/avatar', {create: false}, (directory) => {  
        this.file.checkFile(this.file.externalRootDirectory + 'icollect/avatar/', id + '.jpg').then((files) => { 
          this.avatar = this.file.externalRootDirectory + 'icollect/avatar/' +  id + '.jpg';
        }).catch((err) => {this.avatar = 'assets/imgs/user.png';});
      },(error) => {this.avatar = 'assets/imgs/user.png'; });
    },(error) => { this.avatar = 'assets/imgs/user.png'; });

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT c.p_phone, c.p_phone2, c.p_phone3, c.p_phone4, c.p_email, c.p_email2, c.p_email3, c.id_coop_member, c.id_coop_member_no, c.state, c.district, g.cvalue AS id_gender, c.birth_date, l.cvalue AS national_lang, c.notes, c.town_name, c.p_street1, c.name, c.id_contact FROM contacts c LEFT JOIN (SELECT id_regvalue, cvalue FROM registervalues WHERE id_register = 7) l ON c.national_lang = l.id_regvalue LEFT JOIN (SELECT id_regvalue, cvalue FROM registervalues WHERE id_register = 41) g ON c.id_gender = g.id_regvalue WHERE c.id_contact ='+id, {})
      .then(res => { 
        this.townName = res.rows.item(0).town_name;
        this.contactName = res.rows.item(0).name;
        
        this.p_phone = res.rows.item(0).p_phone;
        this.p_phone2 = res.rows.item(0).p_phone2;
        this.p_phone3 = res.rows.item(0).p_phone3;
        this.p_phone4 = res.rows.item(0).p_phone4;  
        
        if(res.rows.item(0).p_email == undefined){ 
          Email1 = "";
        } else { Email1 = res.rows.item(0).p_email; }
        this.p_email1 = Email1;

        this.p_email2 = res.rows.item(0).p_email2;
        this.p_email3 = res.rows.item(0).p_email3;

        if(res.rows.item(0).id_coop_member == undefined){ 
          CoopStored = "";
        } else { CoopStored = res.rows.item(0).id_coop_member; }
        this.id_coop_member = CoopStored;

        this.id_coop_member_no = res.rows.item(0).id_coop_member_no; 

        this.state = res.rows.item(0).state;
        this.district = res.rows.item(0).district;
        this.town_name = res.rows.item(0).town_name;
        this.p_street1 = res.rows.item(0).p_street1;
        this.gender = res.rows.item(0).id_gender;
        this.birth_date = res.rows.item(0).birth_date;
        this.national_lang = res.rows.item(0).national_lang;
        this.notes = res.rows.item(0).notes;

      }).catch(e => {
        console.log(e)
      });

    }).catch(e => console.log(e));
  }

  syncMobTicker() {
    return new Promise((resolve,reject)=>{
      if (this.network.type == 'none' ) {
        console.log('Offline');
        reject();
      } else {
        this.sqlite.create({
          name: 'icollect.db',
          location: 'default'
        }).then((db: SQLiteObject) => {
          db.executeSql("SELECT contact_id, plantation_id, field_name, field_value, field_table, ticker_time, coordx, coordy, sync FROM mobcrmticker WHERE sync = 0", {})
          .then(res => { 
            for(let i=0; i<res.rows.length; i++){ 
              var link = 'https://idiscover.ch/api/restifydb/postgres/mobcrmticker';
              var myData = JSON.stringify({contact_id:res.rows.item(i).contact_id, plantation_id:res.rows.item(i).plantation_id, field_name:res.rows.item(i).field_name, field_value:res.rows.item(i).field_value, field_table:res.rows.item(i).field_table, ticker_time:res.rows.item(i).ticker_time, coordx:res.rows.item(i).coordx, coordy:res.rows.item(i).coordy, sync:res.rows.item(i).sync});
              
              this.http.post(link, myData)
              .subscribe(r => { console.log(r); }, error => { console.log("Oooops!"); });
            } 

            resolve();
    
          }).catch(e => {
            console.log(e);
            reject();
          });
    
        }).catch(e => { console.log(e)});
      }
    });
  }

  editContact() { 
    let id = this.navParams.get('id_contact');
    let company_name = this.navParams.get('company_name'); 
    let idPrimaryCompany = this.navParams.get('id_primary_company'); 

    let logged_name = this.navParams.get('logged_name');
    let logged_id = this.navParams.get('logged_id');  

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => { 
      db.executeSql('SELECT p_phone, p_phone2, p_phone3, p_phone4, p_email, p_email2, p_email3, id_cooperative, state, district, id_gender, birth_date, national_lang, notes, id_coop_member, id_coop_member_no, town_name, p_street1, name, id_contact, coordx, coordy FROM contacts WHERE id_contact ='+id, {})
      .then(res => { 

        let data = {
          id_contact : id,
          p_phone : res.rows.item(0).p_phone,
          p_phone2 : res.rows.item(0).p_phone2,
          p_phone3 : res.rows.item(0).p_phone3,
          p_phone4 : res.rows.item(0).p_phone4,
          p_email : res.rows.item(0).p_email,
          p_email2 : res.rows.item(0).p_email2,
          p_email3 : res.rows.item(0).p_email3,
          id_coop_member : res.rows.item(0).id_coop_member,
          id_coop_member_no : res.rows.item(0).id_coop_member_no,
          state : res.rows.item(0).state,
          district : res.rows.item(0).district,
          town_name : res.rows.item(0).town_name,
          p_street1 : res.rows.item(0).p_street1,
          id_gender : res.rows.item(0).id_gender,
          birth_date : res.rows.item(0).birth_date,
          national_lang : res.rows.item(0).national_lang,
          notes : res.rows.item(0).notes,
          contactName : res.rows.item(0).name,
          coordx : res.rows.item(0).coordx,
          coordy : res.rows.item(0).coordy,
          id_primary_company : idPrimaryCompany,
          company_name: company_name,
          logged_id: logged_id,
          logged_name: logged_name
        }; 

        this.navCtrl.push(EditContactPage, data); 

      }).catch(e => {
        console.log(e)
      });
    }).catch(e => console.log(e));
  }

  syncInfo() { 
    let id = this.navParams.get('id_contact');  

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("SELECT sync, field_name FROM mobcrmticker WHERE field_table = 'contact' AND contact_id ="+id, {})
      .then(res => { 

        for(let i=0; i<res.rows.length; i++){ 
          
          if(res.rows.item(i).field_name == 'p_phone'){  
            if(res.rows.item(i).sync == 1){ 
              this.p_phone_sync_yes = true; 
              this.p_phone_sync_no = false; 
            } else { 
              this.p_phone_sync_no = true; 
              this.p_phone_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'p_phone2'){ 
            if(res.rows.item(i).sync == 1){ 
              this.p_phone2_sync_yes = true; 
              this.p_phone2_sync_no = false; 
            } else { 
              this.p_phone2_sync_no = true; 
              this.p_phone2_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'p_phone3'){ 
            if(res.rows.item(i).sync == 1){ 
              this.p_phone3_sync_yes = true; 
              this.p_phone3_sync_no = false;
            } else { 
              this.p_phone3_sync_no = true; 
              this.p_phone3_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'p_phone4'){ 
            if(res.rows.item(i).sync == 1){ 
              this.p_phone4_sync_yes = true; 
              this.p_phone4_sync_no = false; 
            } else { 
              this.p_phone4_sync_no = true; 
              this.p_phone4_sync_yes = false; 
            }
          }
          
          if(res.rows.item(i).field_name == 'p_email2'){ 
            if(res.rows.item(i).sync == 1){ 
              this.p_email2_sync_yes = true; 
              this.p_email2_sync_no = false; 
            } else { 
              this.p_email2_sync_no = true; 
              this.p_email2_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'p_email1'){ 
            if(res.rows.item(i).sync == 1){ 
              this.p_email1_sync_yes = true; 
              this.p_email1_sync_no = false; 
            } else { 
              this.p_email1_sync_no = true; 
              this.p_email1_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'p_email3'){ 
            if(res.rows.item(i).sync == 1){ 
              this.p_email3_sync_yes = true; 
              this.p_email3_sync_no = false; 
            } else { 
              this.p_email3_sync_no = true; 
              this.p_email3_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'id_coop_member_no'){ 
            if(res.rows.item(i).sync == 1){ 
              this.id_coop_member_no_sync_yes = true; 
              this.id_coop_member_no_sync_no = false; 
            } else { 
              this.id_coop_member_no_sync_no = true; 
              this.id_coop_member_no_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'town_name'){ 
            if(res.rows.item(i).sync == 1){ 
              this.town_name_sync_yes = true; 
              this.town_name_sync_no = false;
            } else { 
              this.town_name_sync_no = true; 
              this.town_name_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'p_street1'){ 
            if(res.rows.item(i).sync == 1){ 
              this.p_street1_sync_yes = true; 
              this.p_street1_sync_no = false; 
            } else { 
              this.p_street1_sync_no = true; 
              this.p_street1_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'id_gender'){ 
            if(res.rows.item(i).sync == 1){ 
              this.gender_sync_yes = true; 
              this.gender_sync_no = false; 
            } else { 
              this.gender_sync_no = true; 
              this.gender_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'birth_date'){ 
            if(res.rows.item(i).sync == 1){ 
              this.birth_date_sync_yes = true; 
              this.birth_date_sync_no = false; 
            } else { 
              this.birth_date_sync_no = true; 
              this.birth_date_sync_yes = false; 
            }
          }

          if(res.rows.item(i).field_name == 'national_lang'){ 
            if(res.rows.item(i).sync == 1){ 
              this.national_lang_sync_yes = true; 
              this.national_lang_sync_no = false;
            } else { 
              this.national_lang_sync_no = true; 
              this.national_lang_sync_yes = false; 
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

  contactList() {
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');   
    let company = this.navParams.get('company_name');  
    let idPrimaryCompany = this.navParams.get('id_primary_company');

    let data = {
      logged_id : logged_id,
      logged_name : logged_name,
      id_primary_company : idPrimaryCompany,
      company_name : company
    }; 
    this.navCtrl.push(ContactsPage, data);
  }

  plantations() {
    let id = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name'); 
    let name = this.navParams.get('name');  
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('town_name');  
    let id_primary_company = this.navParams.get('id_primary_company');

    let data = {
      id_contact : id,
      logged_id: logged_id,
      logged_name: logged_name,
      name: name,
      company_name: company,
      town_name: town_name,
      id_primary_company: id_primary_company 
    };

    this.navCtrl.push(PlantationsPage, data);
  }

  homeMap() { 
    let id = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name'); 
    let name = this.navParams.get('name'); 
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('town_name');  
    let id_primary_company = this.navParams.get('id_primary_company');

    let data = {
      id_contact : id,
      logged_id: logged_id,
      logged_name: logged_name,
      name: name,
      company_name: company,
      town_name: town_name,
      id_primary_company: id_primary_company
    };
    
    this.navCtrl.push(HomeMapPage, data); 
  }

  documents() {
    let id = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name'); 
    let name = this.navParams.get('name');
    let company = this.navParams.get('company_name');
    let town_name = this.navParams.get('town_name');
    let id_primary_company = this.navParams.get('id_primary_company');

    let data = {
      id_contact : id,
      logged_id: logged_id,
      logged_name: logged_name,
      name: name,
      company_name: company,
      town_name: town_name,
      id_primary_company: id_primary_company
    };
    
    this.navCtrl.push(ContactDocumentsPage, data);
  }

}
