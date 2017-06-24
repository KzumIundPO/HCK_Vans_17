import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation/index';
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

  constructor(public navCtrl: NavController, public geolocation: Geolocation, public alertCtrl: AlertController) {
    var that = this;

    $.ajax({
      url: 'http://62.75.162.57:3000/destinations',
      data: {
        format: 'json'
      },
      error: function (err) {
        console.log('error while retrieving data from the backend' + err)
      },
      success: function (json) {
        console.log(json);
        that.stack = json;
        that.loadMap();

      },
      type: 'GET',
      async: false
    });

    setInterval(function () {
      var thatthat = that;

      $.ajax({
        url: 'http://62.75.162.57:3000/isUpdate',
        data: {
          format: 'json'
        },
        error: function (err) {
          console.log('error while retrieving data from the backend' + err)
        },
        success: function (data) {
          console.log(data);
          if (data) {
            $.ajax({
              url: 'http://62.75.162.57:3000/destinations',
              data: {
                format: 'json'
              },
              error: function (err) {
                console.log('error while retrieving data from the backend' + err)
              },
              success: function (json) {

                that.stack = json;
                that.loadMap();

              },
              type: 'GET',
              async: false
            });
          }
        },
        type: 'GET',
        async: false
      });


    }, 2000);

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

      var geocoder = new google.maps.Geocoder;

      var trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(this.map);


      google.maps.event.addListener(this.map, "click", function (event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        // populate yor box/field with lat, lng
        window.alert("Lat=" + lat + "; Lng=" + lng);


        var latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

        geocoder.geocode({ 'location': latlng }, function (results, status) {
          if (status === 'OK' && !results[0].formatted_address.includes("Unnamed")) {
            console.log(results[0].formatted_address);
            // ---------------------------------------
            $.ajax({
              url: 'http://62.75.162.57:3000/addOnTheGoPackage',
              type: 'post',
              contentType: 'application/json',
              data: JSON.stringify({
                "empfeanger_id": 1, 
                "ablageort_lat": 0,
                "ablageort_lng": 0,
                "parkhinweis_lat": 0,
                "parkhinweis_lng": 0, 
                "addresse_on_the_go": results[0].formatted_address
              }),
              success: function (data, textStatus, jQxhr) {
                $('#response pre').html(JSON.stringify(data));
                console.log("SUCCESFULL POST");
              },
              error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
                console.log("ERR POST");
              }
            });
          
          } else {
            window.alert('Geocoder failed due to: ' + status);
          }
        });
      });


      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer;

      directionsDisplay.setMap(this.map);

      this.stack.forEach((dest, index) => {
        // destinations.push(new google.maps.LatLng(dest.latitude, dest.longitude));
        if (dest.status != 'delivered') {
          destinations.push({ location: dest.ort + ', ' + dest.strasse, stopover: true });
          last = dest.ort + ', ' + dest.strasse;

        }
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

  pickUp(item) {

    let alert = this.alertCtrl.create({
      title: 'Paket zugestellt?',
      message: 'Haben Sie das Paket erfolgreich an ' + item.name + ', ' + item.vorname + 'übergeben?',
      buttons: [
        {
          text: 'Abbrechen',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ja, Paket abgegeben',
          handler: () => {
            console.log('update');
            $.ajax({
              url: 'http://62.75.162.57:3000/update/' + item.id + '/delivered',
              data: {
                format: 'json'
              },
              error: function (err) {
                console.log('error while update')
              },
              success: function (json) {
                console.log('update successful');
              },
              type: 'GET',
              async: false
            });
          }
        }
      ]
    });
    alert.present();

  }
}