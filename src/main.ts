import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
const Web3 = require('web3');

if (environment.production) {
  enableProdMode();
}


  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.log(err));
