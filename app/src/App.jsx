import { useState, useEffect } from 'react';
import './App.css';
import MobileApp from './MobileApp.jsx';
import DesktopApp from './DesktopApp.jsx';
import 'leaflet/dist/leaflet.css';
import { isMobile } from 'react-device-detect';

const App = () => {
  if (isMobile) {
    return <MobileApp />;
  } else {
    return <DesktopApp />;
  }
};

export default App;
