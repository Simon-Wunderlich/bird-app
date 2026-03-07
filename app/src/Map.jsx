import { useState, useEffect } from "react";
import { IconButton, Dialog, Portal, Button } from "@chakra-ui/react";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { FaLocationDot } from 'react-icons/fa6';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    shadowAnchor: [12, 41],  // the same for the shadow
});

L.Marker.prototype.options.icon = DefaultIcon; 


const Map = ({setLocation, location}) => {
  const [openMap, setOpenMap] = useState(false);
  const [marker, setMarker] = useState([-37.8136, 144.9631]);

  useEffect (() => {
      setMarker([location.latitude, location.longitude]);
  }, [setOpenMap])
  const setLocationFromMarker = () => {
    console.log(marker);
    setLocation({ latitude: marker.lat, longitude: marker.lng });
    setOpenMap(false);
  };
  const handleClick = (event) => {
    const { lat, lng } = event.latlng;
    console.log(lat);
    setMarker([lat, lng]);
  };
    return (
        <>
        <IconButton onClick={() => setOpenMap(true)}>
        <FaLocationDot />
        </IconButton>
        <Dialog.Root
        open={openMap}
        onOpenChange={(e) => setOpenMap(e.openInfo)}
        size="lg"
        >
        <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
        <Dialog.Content>
        <Dialog.Header>
        <Dialog.Title>
        Set your location manually
        </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
        <MapContainer
        style={{ height: '400px' }}
        center={marker}
        zoom={13}
        scrollWheelZoom={false}
        onClick={handleClick}
        >
        <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={marker} />
        <MapComponent setMarker={setMarker} />
        </MapContainer>
        <Button onClick={setLocationFromMarker}>OK</Button>
        </Dialog.Body>
        </Dialog.Content>
        </Dialog.Positioner>
        </Portal>
        </Dialog.Root>
        </>
    );
}

function MapComponent({ setMarker }) {
  const map = useMapEvents({
    click: (e) => {
      setMarker(e.latlng);
      map.locate();
    },
    locationfound: (location) => {
      console.log('location found:', location);
    },
  });
  return null;
}

export default Map;
