import { environment } from '../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-catalogs',
  templateUrl: './catalogs.page.html',
  styleUrls: ['./catalogs.page.scss'],
})
export class CatalogsPage implements OnInit {
catalogs;
accounts;

  constructor(
    private authService   : AuthService,
    public alertController: AlertController,
    private navCtrl       : NavController
  ) { }

   async ngOnInit() {
     await this.verifyAuth();
     await this.getCatalogs();
     await this.getAutorizedAccount();
  }
  async getCatalogs(){
    let token = await this.authService.getUserToken();
    let headers:object = {
      'Content-Type'  : 'application/json',
      'X-access-token': token
    };
    interface body { [key: string]: any };
    let body:body = {};
    this.catalogs = await this.authService.requestService( 'get', `${environment.catalogsEndPoint}`, headers, body );
    this.catalogs = this.catalogs.response.type_cards;
    console.log(this.catalogs);
  }//getCatalogs ends..

  async getAccount(index){
    let token = await this.authService.getUserToken();
    let userID = await this.authService.getUserId();
    let headers:object = {
      'Content-Type'  : 'application/json',
      'X-access-token': token
    };
    interface body { [key: string]: any };
    let body:body = {
      "userId": userID,
      "type"  : this.catalogs[index].type,
      "name"  : this.catalogs[index].name
    };
    let response = await this.authService.requestService( 'post', `${environment.accountEndPoint}`, headers, body );

    if(response.success){
      console.log('Mensaje: '+ response.success);
      this.presentAlert(response.success, 'Solicitud de cuenta', 'Satisfactorio');
    }else{
      this.presentAlert('Cuenta no solicitada, ocurrió un error. Intente nuevamente más tarde', 'Solicitud de cuenta', 'Error');
    }
  }//getAccount ends..

  async presentAlert(msg, header, subHeader) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  async verifyAuth(){
    let response = await this.authService.getUserToken();
    console.log('verifyAuth: ');
    console.log(response);

    if(response == false){
      this.navCtrl.navigateForward(`/`);
    }
  }

  async getAutorizedAccount(){
    // let data:any = {
    //   "response": [
    //     {
    //       '_id'        : '12345',
    //       'name'       : 'Tarjeta Oro',
    //       'type'       : 'TDC',
    //       'userId'     : '5b7ae88fe',
    //       'deposits'   : 0,
    //       'withdrawals': 0,
    //       'balance'    : 0
    //     },
    //     {
    //       '_id'        : '12345',
    //       'name'       : 'Tarjeta Platino',
    //       'type'       : 'TDD',
    //       'userId'     : '5b7ae88fe',
    //       'deposits'   : 2,
    //       'withdrawals': 1,
    //       'balance'    : 100
    //     }
    //   ]
    // };//data ends..
    // this.accounts = data.response; //<- Change this for service

    /********************************************
    * For 'test' when info es empty or unauthorized
    *********************************************/
    // this.accounts = [];
    /*********************************************/

    /***********************************
    * Uncomment this to connect service
    ************************************/
    let token = await this.authService.getUserToken();
    let headers:object = {
      'Content-Type'  : 'application/json',
      'X-access-token': token
    };
    interface body { [key: string]: any };
    let body:body = {};
    let response  = await this.authService.requestService('get', environment.accountEndPoint, headers, body);
    this.accounts = response.response;

    if(this.accounts.length == 0){
      console.log('response empty');
      console.log(this.accounts);
    }else{
      console.log('existen datos');
    }

  }//getAutorizedAccount ends..

}//CatalogsPage ends..
