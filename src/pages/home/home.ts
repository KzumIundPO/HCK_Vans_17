import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as $ from "jquery";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  users = [];

  constructor(public navCtrl: NavController) {

  }

  ionViewDidEnter(){
    $.get( "http://62.75.162.57:3000/customerData/", function( data ) {
      data.forEach(element => {
      this.users.push(element);
      });
      console.log(this.users);
  });
}

}
