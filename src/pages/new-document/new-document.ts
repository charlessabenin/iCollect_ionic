import { Component } from '@angular/core';
import { File } from '@ionic-native/file';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { IonicPage, NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
//import { FileTransfer } from '@ionic-native/file-transfer';

declare var window;

import { EditContactPage } from '../edit-contact/edit-contact';

@IonicPage()
@Component({
  selector: 'page-new-document',
  templateUrl: 'new-document.html',
})

export class NewDocumentPage {

  myCustomUserService;
  docTypeList: any;

  public avatar: string;
  public docImg: string;

  contactName;
  townName;
  doc_type;
  doc_date;
  description;

  docFileName;

  constructor(public navCtrl: NavController, 
    public sqlite: SQLite, 
    public file: File,
    public view: ViewController,
    private camera:Camera, 
    //private transfer: FileTransfer,
    public toastCtrl: ToastController,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    let id = this.navParams.get('id_contact');  
    this.contactName = this.navParams.get('name'); 
    this.townName = this.navParams.get('town_name');

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('icollect/avatar', {create: false}, (directory) => {  
        this.file.checkFile(this.file.externalRootDirectory + 'icollect/avatar/', id + '.jpg').then((files) => { 
          this.avatar = this.file.externalRootDirectory + 'icollect/avatar/' +  id + '.jpg';
        }).catch((err) => { this.avatar = 'assets/imgs/user.png'; });
      }, (error) => { this.avatar = 'assets/imgs/user.png'; });
    }, (error) => { this.avatar = 'assets/imgs/user.png'; });

    this.getdocTypeList();
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
    let id_contact = this.navParams.get('id_contact');
    let aDate = new Date(), aTime = aDate.getTime();

    this.camera.getPicture(this.docOptions).then((imagePath) => {
      let newFileName = id_contact +"-"+ aTime + ".jpg"; 
      this.docFileName = newFileName;

      window.resolveLocalFileSystemURL(imagePath,(file) => {
        window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
          fileSys.root.getDirectory('icollect/documents/', {create: true, exclusive: false}, (directory) => {
            file.moveTo(directory, newFileName,(fileEntry) => { 
              this.saveDocData(id_contact,newFileName);
              this.myCustomUserService.SetProfilePhotoUrl(fileEntry.nativeURL);
            },(error) => { console.log('The file was unable to be moved'); });
          },(error) => { console.log('Could not get a reference to your app folder'); });
        },(error) => { console.log('Could not get a reference to the file system'); });
      });

    }, (err) => { console.log('Could not take picture') });
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

  saveDocData(id_contact,filename) { 
    let date =  new Date().toISOString(); 

    this.sqlite.create({
      name: 'icollect.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("INSERT INTO contact_docs (id_contact, doc_date, filename) VALUES ("+id_contact+",'"+date+"','"+filename+"')", {})
      .then(res => { 
        this.doc_date = date;

        window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
          fileSys.root.getDirectory('icollect/documents', {create: false}, (directory) => {  
            this.file.checkFile(this.file.externalRootDirectory + 'icollect/documents/', filename).then((files) => { 
              this.docImg = this.file.externalRootDirectory + 'icollect/documents/' +  filename;
            }).catch((err) => { this.docImg = 'assets/imgs/id.png'; });
          }, (error) => { this.docImg = 'assets/imgs/id.png'; });
        }, (error) => { this.docImg = 'assets/imgs/id.png'; });
        
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

  updateDocument() {
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
      db.executeSql("SELECT id_doc FROM contact_docs WHERE filename = '"+this.docFileName+"'", {})
      .then(res => { 
        let id_doc =  res.rows.item(0).id_doc; 

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

          this.sqlite.create({
            name: 'icollect.db',
            location: 'default'
          }).then((db: SQLiteObject) => { 
            db.executeSql('SELECT p_phone, p_phone2, p_phone3, p_phone4, p_email, p_email2, p_email3, id_cooperative, state, district, id_gender, birth_date, national_lang, notes, id_coop_member, id_coop_member_no, town_name, p_street1, name, id_contact, coordx, coordy FROM contacts WHERE id_contact ='+id_contact, {})
            .then(res => { 
      
              let data = {
                id_contact : id_contact,
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
                id_primary_company : id_primary_company,
                company_name: company_name,
                logged_id: logged_id,
                logged_name: logged_name
              }; 
      
              this.navCtrl.push(EditContactPage, data); 
      
            }).catch(e => {
              console.log(e)
            });
          }).catch(e => console.log(e));


        }).catch(e => { console.log(e) });
      }).catch(e => { alert(10); console.log(e); });

    }).catch(e => console.log(e));
  }

}
