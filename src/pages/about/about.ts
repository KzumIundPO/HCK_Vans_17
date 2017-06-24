import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import * as $ from 'jquery'

declare var google;


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {


  @ViewChild('map') mapElement;
  map: any;
  stack = [];
  current;
  previous;

  constructor(public navCtrl: NavController, public geolocation: Geolocation) {
    var that = this;

    $.get('http://62.75.162.57:3000/destinations', function (json) {
      console.log(json);
      that.stack = json;
      that.loadMap();

    });

  }

  ionViewDidEnter() {

  }

  loadMap() {
    console.log('loading map')
    var destinations = [];
    var startLocation;
    var last;

    this.geolocation.getCurrentPosition().then((position) => {
      startLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      console.log(startLocation)

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);


      var trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(this.map);


      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer;

      directionsDisplay.setMap(this.map);

      this.stack.forEach((dest, index) => {
        // destinations.push(new google.maps.LatLng(dest.latitude, dest.longitude));
        destinations.push({ location: dest.ort + ', ' + dest.strasse, stopover: true });
        last = dest.ort + ', ' + dest.strasse;

        //   let marker = new google.maps.Marker({
        //     map: this.map,
        //     animation: google.maps.Animation.DROP,
        //     position: new google.maps.LatLng(dest.latitude, dest.longitude)
        //   });

        //   marker.setMap(this.map);

        console.log(index, this.stack.length - 1)
        if (index === this.stack.length - 1) {
          this.calculateAndDisplayRoute(directionsService, directionsDisplay, destinations, startLocation, last);

        }
      });


    }, (err) => {
      console.log(err);
    });

  }


  calculateAndDisplayRoute(directionsService, directionsDisplay, waypts, origin, destination) {

    console.log(waypts)

    directionsService.route({
      origin: origin,
      destination: destination,
      waypoints: waypts,
      optimizeWaypoints: true,
      travelMode: 'DRIVING'
    }, function (response, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
        // var route = response.routes[0];
        // var summaryPanel = document.getElementById('directions-panel');
        // summaryPanel.innerHTML = '';
        // // For each route, display summary information.
        // for (var i = 0; i < route.legs.length; i++) {
        //   var routeSegment = i + 1;
        //   summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
        //     '</b><br>';
        //   summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
        //   summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
        //   summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
        // }
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

}