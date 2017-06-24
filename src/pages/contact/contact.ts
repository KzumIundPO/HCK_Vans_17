import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as $ from "jquery";

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  constructor(public navCtrl: NavController) {

  }

  articles = [];

  ionViewDidEnter(){
    $.get( "http://62.75.162.57:3000/customerData/", function( data ) {
      console.log(data);
      data.forEach(element => {
        this.user.push(data);
      });
    $( ".result" ).html( data );
    alert( "Load was performed." );
  });
}

}
