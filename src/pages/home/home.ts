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

  ionViewDidEnter() {
    var that = this;
    $.get("http://62.75.162.57:3000/customerData/", function (data) {
      that.users.push(data);
    });
  }

}
