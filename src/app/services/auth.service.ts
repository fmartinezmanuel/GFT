import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ModalController } from '@ionic/angular';
import { ActionPage } from '../modals/action/action.page';
import * as jwt_decode from "jwt-decode";
import { NavController } from '@ionic/angular';

const apiUrl           = environment.domainApiUrl;
const loginEndPoint    = environment.loginEndPoint;
const registerEndPoint = environment.registerEndPoint;

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  defaultHeaders:object = {'Content-Type' : 'application/json'};
  messages ={
    success:{
      service   : 'Service success: ',
      register  : 'Exito! lunch modal',
      loginTitle: '¡Bienvenido!',
      loginMsg  : 'Inicio de sesión satisfactorio.'
    },
    error:{
      default    : '[Error]: ',
      service    : 'Service error: ',
      register   : 'Ups, ocurrio un error',
      loginTitle : '¡Ups! Se ha producido un error.',
      loginMsg   : '¡Usuario incorrecto! Intente nuevamente más tarde.',
      loginVerify: 'Verifica si el servicio de "login" se encuentra esta activo.',
      userID     : 'Información de usuario no encontrada.'
    }
  };
  constructor(
    private http           : HttpClient,
    private storage        : Storage,
    private modalController: ModalController,
    private navCtrl        : NavController
  ){}//constructor ends..

  data: any;
  async requestService( method:string, url:string, header, body:{} ){
    let headers:HttpHeaders;
    headers = new HttpHeaders( header );
    return await this.http.request(method, `${apiUrl}${url}`, { headers: headers, body:body } ).toPromise().then(
      (response) =>{
        this.data = response;
        console.log( this.messages.success.service);
        console.log( this.data );
        return this.data;
      }
    ).catch((error) =>{
      this.data = error;
      console.log( this.messages.error.service );
      console.log( this.data );
      return this.data;
    });
  }//requestService ends..

  async register(data:object){
    let headers:object = this.defaultHeaders;
    interface body { [key: string]: any };
    let body:body = data;
    console.log(body);
    await this.requestService('post', registerEndPoint, headers, body);
    console.log(this.data.success);
    if(this.data.success){
      console.log(this.messages.success.register);
    }else{
      console.log(this.messages.error.register);
    }
  }//register ends..

  async login( email:string, password:string){
     let headers:object = this.defaultHeaders;
     interface body { [key: string]: any };
     let body:body = {};
     body.email    = email;
     body.password = password;
     await this.requestService('post', loginEndPoint, headers, body);
     if( this.data.token ){
       await this.storage.set('X-access-token', this.data.token);
       this.lunchModalAction( this.messages.success.loginTitle, this.messages.success.loginMsg );
       return true;
     }else{
       this.lunchModalAction( this.messages.error.loginTitle, this.messages.error.loginMsg );
       console.log(`${this.messages.error.default}${this.messages.error.loginVerify}`);
       return false;
     }
  }//login ends..

  logout(){
    this.storage.remove('X-access-token');
    this.navCtrl.navigateForward(`/`);
  }

 async getUserId(){
   let userData;
   await this.storage.get('X-access-token').then(val => {
     if (val != null) {
       userData = jwt_decode( val );
       userData = userData.id;
     }else{
       console.log(`${this.messages.error.default}${this.messages.error.userID}`);
       userData =  false;
     }
   });
   return userData;
 }//getUserId ends..

 async getUserToken(){
   let token;
    return await this.storage.get('X-access-token').then(val => {
     if (val != null && val != undefined) {
       token = val;
     }else{
       console.log(`${this.messages.error.default}${this.messages.error.userID}`);
       token =  false;
     }
     return token;
   });
 }//getUserToken ends..

 async lunchModalAction(title, msg) {
   const modal = await this.modalController.create({
     component: ActionPage,
     componentProps: {
       title: title,
       msg  : msg
     }
   });
   modal.present();
 }

}//class AuthService ends..
