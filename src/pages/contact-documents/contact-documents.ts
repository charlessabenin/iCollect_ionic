import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

import { ContactDetailsPage } from '../contact-details/contact-details';
import { EditDocumentPage } from '../edit-document/edit-document';

declare var window;

@IonicPage()
@Component({
  selector: 'page-contact-documents',
  templateUrl: 'contact-documents.html',
})
export class ContactDocumentsPage {

  public avatar: string;
  documents: any;

  FullName;
  townName;
  stored_docs = true;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public file: File,
    public sqlite: SQLite
  ){

  }

  ionViewDidLoad() {
    let id = this.navParams.get('id_contact');
    this.FullName = this.navParams.get('name');
    this.townName = this.navParams.get('town_name');

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('icollect/avatar', {create: false}, (directory) => {  
        this.file.checkFile(this.file.externalRootDirectory + 'icollect/avatar/', id + '.jpg').then((files) => { 
          this.avatar = this.file.externalRootDirectory + 'icollect/avatar/' +  id + '.jpg';
        }).catch((err) => { this.avatar = 'assets/imgs/user.png'; });
      },(error) => { this.avatar = 'assets/imgs/user.png'; });
    },(error) => { this.avatar = 'assets/imgs/user.png'; });

    this.getDocuments().then(
      (val)=> { this.stored_docs = false; },
      (err)=> { this.stored_docs = true;  }
    );
  }

  getDocuments(){
    let id = this.navParams.get('id_contact');

    return new Promise((resolve,reject)=>{
      this.sqlite.create({
        name: 'icollect.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        db.executeSql('SELECT d.id_doc, d.filename, d.doc_date, d.doc_type, d.description, r.cvalue FROM contact_docs d LEFT JOIN (SELECT id_regvalue, cvalue FROM registervalues WHERE id_register = 63) r ON d.doc_type = r.id_regvalue WHERE d.id_contact ='+id, {})
        .then(res => {   
          this.documents = [];

          if(res.rows.length == 0){
            reject();
          } else {
            for(let i=0; i<res.rows.length; i++){ 
              window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0,(fileSys) => {
                fileSys.root.getDirectory('icollect/documents', {create: false}, (directory) => {     
                  this.documents.push({ id_doc : res.rows.item(i).id_doc, doc_date : res.rows.item(i).doc_date, doc_type : res.rows.item(i).cvalue, description : res.rows.item(i).description, docLink: this.file.externalRootDirectory + 'icollect/documents/' +  res.rows.item(i).filename });
                },(error) => {  });
              }, (error) => {  });
            } 

            resolve();
          }

        }).catch(e => { 
          console.log(e); 
          reject();
        });
      }).catch(e => {
        console.log(e);
        reject();
      });
    });
  }

  editDocument(item) {
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
      company_name : company,
      id_doc : item.id_doc,
      docLink : item.docLink,
      doc_type : item.doc_type,
      doc_date : item.doc_date,
      description : item.description
    };

    this.navCtrl.push(EditDocumentPage, data);
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
