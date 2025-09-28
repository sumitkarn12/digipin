const locationDetails = document.getElementById('location-details');
const searchDigipin = document.getElementById('search-digipin');
const resetMap = document.getElementById('reset-map');
const cardLoader = document.querySelector('.card-loader');
const digipin = document.getElementById('digipin');
const shareBtn = document.getElementById('share');
let t = null;
let map, marker, selectedcoords = null;
let currentlatlng = {
  lat: null,
  lng: null,
  accuracy: null
}
const GOOGLE_MAP_LINK = `https://www.google.com/maps?q=`;
const IP_LOC_API_URL = `https://ipinfo.io/json`;
const PAGE_TITLE = document.title;

function showToast(m, d = 5) {
  t = Toastify({
    text: m,
    duration: d * 1000,
    close: true
  }).showToast();
}

function debounce(callback, delay = 1000) {
  let timeoutId; // Variable to store the timeout ID
  return function(...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback.apply(this, args); // Execute the original function
    }, delay);
  };
}

function render( latlng ) {
  selectedcoords = latlng;
  console.log("Render", latlng);
  digipin.textContent = Get_DIGIPIN(latlng.lat, latlng.lng);
  location.hash = digipin.textContent;
  document.title =  `${PAGE_TITLE} || ${digipin.textContent}`;

  // Update the HTML with the coordinates
  locationDetails.style.display = 'block';
  cardLoader.style.display = 'none';

  if ( !map ) {
    map = L.map('map')
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.zoomControl.setPosition( "bottomright" );
    map.on("click", ev => {
      render({ lat: ev.latlng.lat, lng: ev.latlng.lng, accuracy: 0 });
    })
  }

  map.setView([latlng.lat, latlng.lng], 15);
  
  if ( !marker ) {
    marker = L.marker([latlng.lat, latlng.lng]).addTo(map);
  } else {
    marker.setLatLng(latlng);
  }
  
  let popupHTML = `<strong>Digipin:</strong> ${digipin.textContent}<br/>`;
  popupHTML += `<strong>Latitude:</strong> ${latlng.lat.toFixed(6)}<br/>`;
  popupHTML += `<strong>Longitude:</strong> ${latlng.lng.toFixed(6) }<br/>`;

  popupHTML += ( latlng.accuracy )?`<strong>Accuracy:</strong> ${latlng.accuracy.toFixed(2) }<br/>`:''; 
  popupHTML += `<a href="${GOOGLE_MAP_LINK}${latlng.lat},${latlng.lng}" target="_blank">See on Google Maps</a>`;
  marker.bindPopup( popupHTML ).openPopup();

  map.flyTo( latlng );
}

function resetMapMarker() {
  locationDetails.style.display = 'none';
  cardLoader.style.display = 'block';
  if ( Math.min( currentlatlng.lat, currentlatlng.lng ) == 0 || isNaN(Math.min( currentlatlng.lat, currentlatlng.lng ) ) ) {
    console.log( "Fetching coordinates" );
    navigator.permissions.query({name: 'geolocation'}).then( r => {
      handleLocationPermission( r.state );
      r.onchange = ( e ) => {
        e.preventDefault();
        handleLocationPermission( e.target.state );
      }
    });
  } else {
    console.log( "Rendering map from cache", currentlatlng );
    render( currentlatlng );
  }
}

digipin.addEventListener("click", ( e ) => {
  navigator.clipboard.writeText( e.target.textContent );
  showToast(`DIGIPIN copied to your clipboard.`)
});
searchDigipin.addEventListener("input", debounce(e => {
  e.preventDefault();
  handleHash( e.target.value.toUpperCase().trim() );
}));
resetMap.addEventListener("click", ( e ) => {
  e.preventDefault();
  resetMapMarker();
});
shareBtn.addEventListener( "click", e => {
  e.preventDefault();
  navigator.share( digipin.textContent );
  let shareData = {
    title: digipin.textContent,
    text: `Here is my _DIGIPIN_ details.\n\nDIGIPIN: *${digipin.textContent}*\nLatitude: ${selectedcoords.lat.toFixed(6)}\nLongitude: ${selectedcoords.lng.toFixed(6)}\n\nYou can find yours as well.\n\n`,
    url: location.href
  };

  if (!navigator.canShare) {
    showToast("navigator.canShare() not supported.");
  } else if (navigator.canShare(shareData)) {
    navigator.share( shareData );
  } else {
    showToast("Specified data cannot be shared.");
  }
});

async function getGeoLocation() {
  return new Promise( ( resolve, reject ) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        t?.hideToast();
        // Success callback
        currentlatlng.lat = position.coords.latitude;
        currentlatlng.lng = position.coords.longitude;
        currentlatlng.accuracy = position.coords.accuracy;

        resolve(currentlatlng);
      },
      (error) => {
        reject( error );
      }
    );
  });
}

async function getLocationByIP() {
  return new Promise((resolve, reject) => {
    fetch( IP_LOC_API_URL ). then( res => res.json()).
    then( j => {
      let loc = j.loc.split(",").map(a => parseFloat(a));
      currentlatlng.lat = loc[0];
      currentlatlng.lng = loc[1];
      currentlatlng.accuracy = 1000;
      resolve( currentlatlng );
    })
    .catch( () => { reject( "Unable to fetch location by IP." ) });
  });
}

function handleLocationPermission( state ) {
  if ( state == "denied" ) {
    showToast( "GPS Permission denied by the user hence fetching location using IP." );
    return getLocationByIP().then( render ).catch( err => {
      showToast( JSON.stringify( err ) );
    });
  }
  getGeoLocation().then( res => {
    render( res );
  }).catch( err => {
    showToast( JSON.stringify(err) + "<br/> You should reload the page." );
    getLocationByIP().then( render );
  });
}

function handleHash( hash ) {
  console.log( hash );
  let decodedDigipin = Get_LatLng_By_Digipin( hash.replaceAll("#", "").toUpperCase() );
  if ( decodedDigipin != "Invalid DIGIPIN" ) {
    decodedDigipin = decodedDigipin.split(",").map( a => parseFloat( a) );
    console.log("Handling Hash", hash, decodedDigipin);
    render({lat: decodedDigipin[0], lng: decodedDigipin[1], accuracy: 0});
  }
}

if ( location.hash.length != 0 ) {
  console.log( "Decoding hash" );
  handleHash( location.hash );
} else {
  console.log( "CURRENT LOCATION" );
  resetMapMarker();
}

/**
 * Function GET_DIGIPIN() takes latitude-longitude as input and encodes
 * it into a 10 digit alphanumeric code
 * A higher precision (upto 5 decimal places) of latitude-longitude input
 * values results in more precise DIGIPIN
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
  Function Get_LatLng_By_Digipin() takes a 10 digit alphanumeric code
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