import { Component } from '@angular/core';
import { File } from '@ionic-native/file';
import { ToastController } from 'ionic-angular';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

import { ContactDocumentsPage } from '../contact-documents/contact-documents';

declare var window;

@IonicPage()
@Component({
  selector: 'page-edit-document',
  templateUrl: 'edit-document.html',
})
export class EditDocumentPage {

  public avatar: string;
  docTypeList: any;

  contactName;
  townName;
  docLink;
  doc_type;
  doc_date;
  description;

  constructor(public navCtrl: NavController, 
    public sqlite: SQLite,
    public file: File,
    public navParams: NavParams,
    public toastCtrl: ToastController  
  ){
  }

  ionViewDidLoad() {
    let id = this.navParams.get('id_contact'); 

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('icollect/avatar', {create: false}, (directory) => {  
        this.file.checkFile(this.file.externalRootDirectory + 'icollect/avatar/', id + '.jpg').then((files) => { 
          this.avatar = this.file.externalRootDirectory + 'icollect/avatar/' +  id + '.jpg';
        }).catch((err) => { this.avatar = 'assets/imgs/user.png'; });
      }, (error) => { this.avatar = 'assets/imgs/user.png'; });
    }, (error) => { this.avatar = 'assets/imgs/user.png'; });

    this.contactName = this.navParams.get('name'); 
    this.townName = this.navParams.get('town_name');  
    this.doc_type = this.navParams.get('doc_type');
    this.doc_date = this.navParams.get('doc_date');
    this.docLink = this.navParams.get('docLink');
    this.description = this.navParams.get('description');

    this.getdocTypeList();
  }

  getdocTypeList() {
    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT id_regvalue, cvalue FROM registervalues WHERE id_register = 63', {})
      .then(res => { 
        this.docTypeList = [];
          for(let i=0; i<res.rows.length; i++){  
            this.docTypeList.push({ id_docType : res.rows.item(i).id_regvalue, doctype : res.rows.item(i).cvalue });
          } 
      }).catch(e => {
        console.log(e)
      });
    }).catch(e => console.log(e));
  }

  updateDocument() {
    let id_doc = this.navParams.get('id_doc');
    let id_contact = this.navParams.get('id_contact');
    let logged_id = this.navParams.get('logged_id');   
    let logged_name = this.navParams.get('logged_name');
    let company_name = this.navParams.get('company_name');
    let town_name = this.navParams.get('town_name');
    let name = this.navParams.get('name');
    let id_primary_company = this.navParams.get('id_primary_company'); 

    let doc_type = this.doc_type;
    let doc_date = this.doc_date;
    let description = this.description;

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("update contact_docs set doc_type='"+doc_type+"', doc_date='"+doc_date+"', description='"+description+"' WHERE id_doc = "+id_doc,{})
      .then(res => {  
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
          id_contact : id_contact,
          name: name,
          logged_name: logged_name,
          company_name: company_name,
          logged_id: logged_id,
          town_name: town_name,
          id_primary_company: id_primary_company
        };
        
        this.navCtrl.push(ContactDocumentsPage, data);

      }).catch(e => {
        console.log(e)
      });

    }).catch(e => console.log(e));
  }

}
