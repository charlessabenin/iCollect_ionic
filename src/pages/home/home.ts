import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { LoginPage } from '../login/login';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout'; 

export interface Slide {
  title: string;
  image: string;
  description: string;
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  slides: Slide[];
  showSkip = true;
  dir: string = 'ltr';

  constructor(public navCtrl: NavController, 
    public translate: TranslateService, 
    public platform: Platform) {
    this.dir = platform.dir();
    this.slides = [
      {
        title: "Supply Chain",
        image: 'assets/imgs/ica-slidebox-img-1.png',
        description: "The Supply Chain's obligation to care. Responsible purchase of raw materials.",
      },
      {
        title: "Farmers",
        image: 'assets/imgs/ica-slidebox-img-2.png',
        description: "Fair prices and constant incomes through guaranteed off-take agreements, which result in greater autonomy for the farmer.",
      },
      {
        title: "Farmer Life",
        image: 'assets/imgs/ica-slidebox-img-3.png',
        description: "Improve the farmer's quality of life. Improved access to education for the farmer's children.",
      }
    ];
  }

  ionViewDidLoad() { 
    
  }

  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd();
  }

  startApp() {
    this.navCtrl.push(LoginPage);
  } 
}
