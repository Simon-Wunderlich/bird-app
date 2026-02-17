import { useState, useEffect } from 'react';
import './App.css';
import MobileApp from './MobileApp.jsx';
import DesktopApp from './DesktopApp.jsx';
import 'leaflet/dist/leaflet.css';
import { isMobile } from 'react-device-detect';



const App = () => {
  const getLatestVersion = async () => {
	const uid = localStorage.getItem("uid");
	const response = await fetch("https://base.sorry.horse:8000/version")
	const version = await response.text();
	if (version != localStorage.getItem("version")) {
		if (caches) {
		    caches.keys().then((names) => {
		      for (const name of names) {
			  console.log("cleared " + name);
			caches.delete(name);
		      }
		    });
			localStorage.setItem("version", version);
			localStorage.setItem("uid", uid);
			window.location.reload(true);
		}
	}
}

useEffect(() => {
	getLatestVersion();
}, [])


  if (isMobile) {
    return <MobileApp />;
  } else {
    return <DesktopApp />;
  }
};

export default App;
