const locationDetails = document.getElementById('location-details');
const searchDigipin = document.getElementById('search-digipin');
const resetMap = document.getElementById('reset-map');
const cardLoader = document.querySelector('.card-loader');
const digipin = document.getElementById('digipin');
const latitudeSpan = document.getElementById('latitude');
const longitudeSpan = document.getElementById('longitude');
const accuracySpan = document.getElementById('accuracy');
let t = null;
let map, marker = null;
let currentlatlng = {
  lat: 13.038485,
  lng: 80.122344,
  accuracy: 35
}
const GOOGLE_MAP_LINK = `https://www.google.com/maps?q=`;

function showToast(m, d = 5) {
  t = Toastify({
    text: m,
    duration: d * 1000,
    close: true
  }).showToast();
}

digipin.addEventListener("click", ( e ) => {
  navigator.clipboard.writeText( e.target.textContent );
  showToast(`DIGIPIN copied to your clipboard.`)
});
searchDigipin.addEventListener("input", e => {
  e.preventDefault();
  let decodedDigipin = Get_LatLng_By_Digipin(e.target.value.trim().toUpperCase());
  if ( decodedDigipin != "Invalid DIGIPIN" ) {
    decodedDigipin = decodedDigipin.split(",").map( a => parseFloat( a) );
    render({lat: decodedDigipin[0], lng: decodedDigipin[1], accuracy: 0});
  }
})
resetMap.addEventListener("click", ( e ) => {
  render( currentlatlng );
})

function render( latlng ) {
  digipin.textContent = Get_DIGIPIN(latlng.lat, latlng.lng);

  // Update the HTML with the coordinates
  locationDetails.style.display = 'grid';
  cardLoader.style.display = 'none';
  latitudeSpan.textContent = latlng.lat.toFixed(6);
  longitudeSpan.textContent = latlng.lng.toFixed(6);
  accuracySpan.textContent = latlng.accuracy.toFixed(2);

  if ( !map ) {
    map = L.map('map').setView([currentlatlng.lat, currentlatlng.lng], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.on("click", ev => {
      render({ lat: ev.latlng.lat, lng: ev.latlng.lng, accuracy: 0 });
    })
    // L.popup({ lat: ev.latlng.lat, lng: ev.latlng.lng, accuracy: 0 }, {
    //   content: `<strong>Digipin:</strong> ${digipin.textContent}<br/><a href="${GOOGLE_MAP_LINK}${latlng.lat},${latlng.lng}" target="_blank">View on Google Maps</a>`
    // }).openOn( map )
  }

  if ( !marker ) {
    marker = L.marker([currentlatlng.lat, currentlatlng.lng]).addTo(map);
  } else {
    marker.setLatLng({ lat: latlng.lat, lng: latlng.lng });
  }
  marker.bindPopup(`<strong>Digipin:</strong> ${digipin.textContent}<br/><a href="${GOOGLE_MAP_LINK}${latlng.lat},${latlng.lng}" target="_blank">View on Google Maps</a>`).openPopup();
}

// Check if the browser supports the Geolocation API
if (navigator.geolocation) {
  // Get the current position
  navigator.geolocation.getCurrentPosition(
    (position) => {
      t?.hideToast();
      // Success callback
      currentlatlng.lat = position.coords.latitude;
      currentlatlng.lng = position.coords.longitude;
      currentlatlng.accuracy = position.coords.accuracy;

      render( currentlatlng );
    },
    (error) => {
      // Error callback
      let errorMessage;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "User denied the request for Geolocation.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "The request to get user location timed out.";
          break;
        case error.UNKNOWN_ERROR:
          errorMessage = "An unknown error occurred.";
          break;
      }
      showToast(errorMessage);
      locationDetails.style.display = 'none';
      console.error("Geolocation error:", error);
    }
  );
} else {
  // Browser doesn't support Geolocation
  showToast('Geolocation is not supported by your browser.');
  locationDetails.style.display = 'none';
}

/**
 * Function GET_DIGIPIN() takes latitude-longitude as input and encodes
it into a 10 digit alphanumeric code
 * A higher precision (upto 5 decimal places) of latitude-longitude input
values results in more precise DIGIPIN
 */
function Get_DIGIPIN(lat, lon) {
  //DIGIPIN Labelling Grid
  var L = [
    ['F', 'C', '9', '8'],
    ['J', '3', '2', '7'],
    ['K', '4', '5', '6'],
    ['L', 'M', 'P', 'T']
  ];
  var vDIGIPIN = '';

  //variable for identification of row and column of the cells
  var row = 0; var column = 0;
  // Bounding Box Extent
  var MinLat = 2.5; var MaxLat = 38.50; var MinLon = 63.50; var MaxLon =
    99.50;
  var LatDivBy = 4; var LonDivBy = 4;
  var LatDivDeg = 0; var LonDivDeg = 0;
  if (lat < MinLat || lat > MaxLat) {
    alert('Latitude Out of range');
    return '';
  }
  if (lon < MinLon || lon > MaxLon) {
    alert('Longitude Out of range');
    return '';
  }
  for (let Lvl = 1; Lvl <= 10; Lvl++) {
    LatDivDeg = (MaxLat - MinLat) / LatDivBy;
    LonDivDeg = (MaxLon - MinLon) / LonDivBy;
    var NextLvlMaxLat = MaxLat;
    var NextLvlMinLat = MaxLat - LatDivDeg;
    for (x = 0; x < LatDivBy; x++) {

      if (lat >= NextLvlMinLat && lat < NextLvlMaxLat) {
        row = x;
        break;
      }
      else {
        NextLvlMaxLat = NextLvlMinLat
        NextLvlMinLat = NextLvlMaxLat - LatDivDeg;
      }
    }

    var NextLvlMinLon = MinLon;
    var NextLvlMaxLon = MinLon + LonDivDeg;
    for (x = 0; x < LonDivBy; x++) {
      if (lon >= NextLvlMinLon && lon < NextLvlMaxLon) {
        column = x;
        break;
      }
      else if ((NextLvlMinLon + LonDivDeg) < MaxLon) { //NEWLY ADDED TO ADDRESS BOUNDARY CONDITION
        NextLvlMinLon = NextLvlMaxLon;
        NextLvlMaxLon = NextLvlMinLon + LonDivDeg;
      }
      else {
        column = x;
      }
    }

    if (Lvl == 1) {
      if (L[row][column] == "0") {
        vDIGIPIN = "Out of Bound";
        break;
      }
    }
    vDIGIPIN = vDIGIPIN + L[row][column];


    if (Lvl == 3 || Lvl == 6) {
      vDIGIPIN = vDIGIPIN + "-"
    }

    // Set Max boundary for nex level
    MinLat = NextLvlMinLat; MaxLat = NextLvlMaxLat;
    MinLon = NextLvlMinLon; MaxLon = NextLvlMaxLon;
  }
  return vDIGIPIN;
}

/**
 * Function Get_LatLng_By_Digipin() takes a 10 digit alphanumeric code
as input and encodes it into degree-decimal coordinates
 */
function Get_LatLng_By_Digipin(vDigiPin) {
  vDigiPin = vDigiPin.replaceAll('-', '');
  if (vDigiPin.length != 10) {
    return "Invalid DIGIPIN";
  }
  //DIGIPIN Labelling Grid
  var L = [
    ['F', 'C', '9', '8'],
    ['J', '3', '2', '7'],
    ['K', '4', '5', '6'],
    ['L', 'M', 'P', 'T']
  ];
  // Bounding Box Extent
  var MinLat = 2.50; var MaxLat = 38.50; var MinLng = 63.50; var MaxLng =
    99.50;
  var LatDivBy = 4;
  var LngDivBy = 4;
  var LatDivVal = 0;
  var LngDivVal = 0;
  var ri, ci, f;
  var Lat1, Lat2, Lng1, Lng2;
  for (let Lvl = 0; Lvl < 10; Lvl++) {
    ri = -1;
    ci = -1;
    const digipinChar = vDigiPin.charAt(Lvl);
    LatDivVal = (MaxLat - MinLat) / LatDivBy;
    LngDivVal = (MaxLng - MinLng) / LngDivBy;
    f = 0;

    for (let r = 0; r < LatDivBy; r++) {
          for (let c = 0; c < LngDivBy; c++) {
            if (L[r][c] == digipinChar) {
              ri = r;
              ci = c;
              f = 1;
              break;
            }
          }
        }

        if (f == 0) {
          return 'Invalid DIGIPIN';
        }
        Lat1 = MaxLat - (LatDivVal * (ri + 1));
        Lat2 = MaxLat - (LatDivVal * (ri));
    Lng1 = MinLng + (LngDivVal * (ci));
    Lng2 = MinLng + (LngDivVal * (ci + 1));

    MinLat = Lat1;
    MaxLat = Lat2;
    MinLng = Lng1;
    MaxLng = Lng2;
  }
  cLat = (Lat2 + Lat1) / 2;
  cLng = (Lng2 + Lng1) / 2;

  return cLat + ', ' + cLng;
}