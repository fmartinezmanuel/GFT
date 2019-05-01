import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormControl, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage{
  loginForm     : FormGroup;
  registerForm  : FormGroup;
  loginView     : boolean = true;
  registerView  : boolean = false;
  loadingPresent: boolean = false;
  email;
  password;
  firstName;
  lastName;
  passwordRegister;
  passwordVerify;
  emailRegister;


  constructor(
    private authService     : AuthService,
    private formBuilder     : FormBuilder,
    private navCtrl         : NavController,
    public alertController  : AlertController,
    public loadingController: LoadingController
  ){
    this.loginForm = formBuilder.group({
      email   :['', Validators.compose([
      Validators.required,
      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
      ])],
      password:['', Validators.compose([
      Validators.required,
      Validators.minLength(5)
      ])]
    });
    this.email    = this.loginForm.controls['email'];
    this.password = this.loginForm.controls['password'];

    this.registerForm = formBuilder.group({
      firstName: ['', Validators.required ],
      lastName : ['', Validators.required ],
      emailRegister   :['', Validators.compose([
      Validators.required,
      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
      ])],
      passwordRegister:['', Validators.compose([
      Validators.required,
      Validators.minLength(5)
      ])],
      passwordVerify:['', Validators.compose([Validators.required, Validators.minLength(5)])]
    },
    { validator: this.MatchPassword }
  );
    this.emailRegister    = this.registerForm.controls['emailRegister'];
    this.passwordRegister = this.registerForm.controls['passwordRegister'];
    this.passwordVerify   = this.registerForm.controls['passwordVerify'];
  }//constructor ends..

  async ngOnInit(){
    await this.verifyAuth();
  }

  async verifyAuth(){
    let response = await this.authService.getUserToken();
    console.log('verifyAuth: ');
    console.log(response);

    if(response != false){
      this.navCtrl.navigateForward(`/catalogs`);
    }
  }

  async registerNewUser(){
    this.registerForm.setErrors( { MatchPassword: true } );
    console.log('Registrando nuevo usuario!');
    this.timeForLoading();
    this.presentLoading();
    await this.authService.register({
      "email"    : this.emailRegister.value,
      "firstname": this.firstName,
      "lastname" : this.lastName,
      "password" : this.passwordRegister.value
    });
    this.timeForLoading();
    this.loadingController.dismiss();
    this.presentAlert('', 'Registro, ¡Satisfactorio!', 'Por seguridad debe iniciar sesión.');
    this.switchRegisterLogin();
  }//registerNewUser ends..

  async sendLogin(){
    this.timeForLoading();
    this.presentLoading();
    this.loginForm.setErrors( { MatchPassword: true } );
    let response = await this.authService.login( this.email.value, this.password.value );
    this.timeForLoading();
    this.loadingController.dismiss();
    console.log('Resultado de login: '+response);
    if(response == true){
      this.navCtrl.navigateForward(`/catalogs`);
    }
  }//sendLogin ends..

  switchRegisterLogin(){
    this.loginView    = !this.loginView;
    this.registerView = !this.registerView;
  }//switchRegisterLogin ends..

  timeForLoading(){
    console.log('Inicio: '+this.loadingPresent);
    this.loadingPresent = !this.loadingPresent;
    console.log('Fin: '+this.loadingPresent);
  }

  private MatchPassword(AC: AbstractControl) {
     const newPassword     = AC.get('passwordRegister').value
     const confirmPassword = AC.get('passwordVerify').value
      if(newPassword != confirmPassword) {
          // console.log('false');
          AC.get('passwordVerify').setErrors( { MatchPassword: true } )
      } else {
          // console.log('true')
          AC.get('passwordVerify').setErrors(null);
      }
  }//private MatchPassword ends..

  async presentAlert(msg, header, subHeader) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }//presentAlert ends..

  async presentLoading() {
      const loading = await this.loadingController.create({
        message: 'Un momento por favor..',
        duration: 2000
      });
      await loading.present();

      const { role, data } = await loading.onDidDismiss();

      console.log('Loading dismissed!');
    }

}//HomePage ends..
