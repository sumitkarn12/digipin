const locationDetails = document.getElementById('location-details');
const digipin = document.getElementById('digipin');
const latitudeSpan = document.getElementById('latitude');
const longitudeSpan = document.getElementById('longitude');
const accuracySpan = document.getElementById('accuracy');
const mapLink = document.getElementById('map-link');

function showToast(m, d = 5) {
  Toastify({
    text: m,
    duration: d * 1000,
  }).showToast();
}

digipin.addEventListener("click", ( e ) => {
  navigator.clipboard.writeText( e.target.textContent );
  showToast(`DIGIPIN: ${e.target.textContent} copied to your clipboard.`)
})

// Check if the browser supports the Geolocation API
if (navigator.geolocation) {
  showToast("Loading...")

  // Get the current position
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // Success callback
      const { latitude, longitude, accuracy } = position.coords;
      digipin.textContent = Get_DIGIPIN( latitude, longitude );

      // Update the HTML with the coordinates
      locationDetails.style.display = 'grid';
      latitudeSpan.textContent = latitude.toFixed(6);
      longitudeSpan.textContent = longitude.toFixed(6);
      accuracySpan.textContent = accuracy.toFixed(2);

      // Create a link to Google Maps
      const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      mapLink.href = mapUrl;
      mapLink.style.display = 'grid';

      var map = L.map('map').setView([latitude, longitude], 14);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      let marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(`<strong>Accuracy:</strong> ${accuracy.toFixed(2)} meters`).openPopup();
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