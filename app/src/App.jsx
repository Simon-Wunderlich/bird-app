import { useState, useEffect } from 'react';
import './App.css';
import MobileApp from './MobileApp.jsx';
import DesktopApp from './DesktopApp.jsx';
import 'leaflet/dist/leaflet.css';
import { isMobile } from 'react-device-detect';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    shadowAnchor: [12, 41],  // the same for the shadow
});

L.Marker.prototype.options.icon = DefaultIcon; 

const App = () => {
  const getLatestVersion = async () => {
    const uid = localStorage.getItem('uid');
    const response = await fetch('https://base.sorry.horse:8000/version');
    const version = await response.text();
    if (version != localStorage.getItem('version')) {
      if (caches) {
        caches.keys().then((names) => {
          for (const name of names) {
            console.log('cleared ' + name);
            caches.delete(name);
          }
        });
        localStorage.setItem('version', version);
	      if (uid != null) {
        localStorage.setItem('uid', uid);
	      }
        window.location.reload(true);
      }
    }
  };

  useEffect(() => {
  }, []);

  if (isMobile) {
    return <MobileApp />;
  } else {
    return <DesktopApp />;
  }
};

export default App;
