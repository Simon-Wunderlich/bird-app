import { useState, useEffect } from 'react'
import './App.css'
import MobileApp from './MobileApp.jsx'
import DesktopApp from './DesktopApp.jsx'
import 'leaflet/dist/leaflet.css';
import { isBrowser, isMobile } from 'react-device-detect';



const App = () => {
    if (isMobile){
	    return <MobileApp />;
    }
    else {
	    return <MobileApp />;
    }
}

export default App

