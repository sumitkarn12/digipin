### **[DIGIPIN](https://digipin.idkey.in) - Your Digital Pincode** 📍

[DIGIPIN](https://digipin.idkey.in) is a simple, client-side web application that helps you find your [DIGIPIN](https://digipin.idkey.in) based on your geographic location or decode a [DIGIPIN](https://digipin.idkey.in) to its precise coordinates. This project is a pilot initiative by India Post, designed to explore a new system for location identification. The web app is entirely self-contained; it runs directly in your browser without any backend server or database, ensuring your privacy as no data is stored or transmitted.

***

### **How it Works** 💻

The core functionality of the [DIGIPIN](https://digipin.idkey.in) web app is built on a few key principles:

* **Client-Side Processing:** All calculations for encoding and decoding [DIGIPIN](https://digipin.idkey.in)s are performed locally on your device within the browser. This means the app works offline after the initial load and doesn't require an active connection to a server for its primary functions.
* **Privacy-Focused:** Because there is no backend, your location data is never sent to a server. It is used only for the purpose of calculating your [DIGIPIN](https://digipin.idkey.in) and is stored in a temporary global object for session management.
* **Location Detection:** The app prioritizes accurate location data. It first prompts you to grant **geolocation permission** to use your device's GPS for the most precise coordinates. If you deny permission or your device doesn't support GPS, a **fallback method** is used to approximate your location via your IP address using the `https://ipinfo.io/json` service. This method may be less accurate but ensures the app remains functional.

***

### **Features** ✨

1.  **Find Your [DIGIPIN](https://digipin.idkey.in):** The app automatically detects your location when you first open the page.
    * If **location permission** is granted, it uses your device's GPS to get highly accurate coordinates and calculates your [DIGIPIN](https://digipin.idkey.in).
    * If permission is denied, it uses your **IP address** to get an approximate location and its corresponding [DIGIPIN](https://digipin.idkey.in).
2.  **Interactive Map:** You can manually get the [DIGIPIN](https://digipin.idkey.in) for any location by clicking or dragging the map to the desired spot. The [DIGIPIN](https://digipin.idkey.in) will be updated based on the coordinates of the selected point. 
3.  **[DIGIPIN](https://digipin.idkey.in) Search & Decoding:** The search bar allows you to enter a [DIGIPIN](https://digipin.idkey.in) to see its corresponding location. Upon a successful search, the map will be centered on the coordinates associated with that [DIGIPIN](https://digipin.idkey.in).
4.  **Shareable URLs:** When a [DIGIPIN](https://digipin.idkey.in) is successfully decoded via the search function, the app automatically appends the [DIGIPIN](https://digipin.idkey.in) to the URL as a hash (e.g., `https://digipin.idkey.in/#digipin`). This makes it easy to share a specific location with others.
5.  **Location Reset:** The initial location (either from GPS or IP) is stored in a global object. This allows you to easily reset the map to your initial detected location at any point. If this global object is empty (e.g., after a page refresh), the app will re-fetch the location based on your permission settings.

# Testing changes in the beta