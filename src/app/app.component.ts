import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

declare var cordova;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if (this.platform.is('ios') && this.platform.is('cordova')) {
        console.log("Initializing iosrtc");
        cordova.plugins.iosrtc.registerGlobals();
        // load adapter.js (version 4.0.1)
        const script2 = document.createElement('script');
        script2.type = 'text/javascript';
        script2.src = 'assets/libs/adapter-4.0.1.js';
        script2.async = false;
        document.head.appendChild(script2);
    }
    });
  }
}
