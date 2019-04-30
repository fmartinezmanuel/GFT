import { Component } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';


@Component({
  selector: 'app-action',
  templateUrl: './action.page.html',
  styleUrls: ['./action.page.scss'],
})

export class ActionPage{
  constructor(
    private modalController: ModalController,
    public navParams       : NavParams
   ){}

  closeModal() {
    this.modalController.dismiss();
  }
}
