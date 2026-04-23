import { useEffect, useState } from 'react';
import ToggleTip from "./PointsToolTip.jsx"
import RegionSearch from './RegionSearch.jsx';
import BirdSearch from './BirdSearch.jsx';
import Map from './Map.jsx';
import Login from './Login.jsx';
import {
  Box,
  Button,
  Dialog,
  FileUpload,
  HStack,
  Icon,
Popover,
	Portal,
} from '@chakra-ui/react';
import { FaCrow } from 'react-icons/fa6';
import { LuUpload, LuInfo } from 'react-icons/lu';
import { toaster } from '@/src/components/ui/toaster';

const AddBird = ({ setUid, uid, setUsers }) => {
  const [location, setLocation] = useState(null);
  const [openNewBird, setOpenBird] = useState(false);
  const [region, setRegion] = useState('');
  const [regCode, setRegCode] = useState('');
  const [bird, setBird] = useState('');
  const [birdCode, setBirdCode] = useState('');
  const [sciName, setSciName] = useState('');
  const [image, setImage] = useState('');
  const [submitBirdLoading, setSubmitBirdLoading] = useState(false);
  const [locationUpdated, setLocationUpdated] = useState(false);

  useEffect(() => {
    const successHandler = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };
    const errorHandler = async (err) => {
      console.log(err.message);
      setLocation({ latitude: 0, longitude: 0 });
      const timer = setTimeout(() => {}, 100);
      return () => clearTimeout(timer);
    };
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
  }, []);
  useEffect(() => {
    setLocationUpdated(true);
  }, [location]);

  useEffect(() => {
    setBird('');
    setImage('');
    setRegion('');
  }, [openNewBird]);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        const fileData = event.target.result;
        setImage(fileData);
      };
      reader.readAsDataURL(uploadedFile);
    }
  };
  const submitBird = async () => {
    if (!locationUpdated) {
      try {
        await new Promise((successHandler, errorHandler) => {
          navigator.geolocation.getCurrentPosition(
            successHandler,
            errorHandler,
            {
              timeout: 10000, // Optional: set a timeout (10 seconds here)
              enableHighAccuracy: true,
            }
          );
        });
      } catch {
        toaster.create({
          description: 'Locaion permissions are required',
          type: 'error',
        });
        return;
      }
    }
    if (bird == '') {
      toaster.create({ description: 'Bird is required', type: 'error' });
      return;
    }

    if (region == '') {
      toaster.create({ description: 'Region is required', type: 'error' });
      return;
    }
    if (image == '') {
      toaster.create({ description: 'Image is required', type: 'error' });
      return;
    }

    setSubmitBirdLoading(true);
    try {
      const data = {
        bird: [birdCode, bird[0], sciName],
        region: regCode,
        regionName: region,
        lat: location.latitude,
        long: location.longitude,
        image: image,
        uid: uid,
      };
      const response = await fetch('https://birdserver.sorry.horse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        toaster.create({
          description: 'An error has occured, please refresh the page',
          type: 'error',
        });
      }
      const result = await response.json();
      console.log(typeof result);
      if (typeof result == 'string') {
        toaster.create({ description: result, type: 'error' });
        setSubmitBirdLoading(false);
        return;
      }
      result.sort((a, b) => b.points - a.points);
      result.map((user) => user.birds.reverse());
      setUsers(result);

      setOpenBird(false);
    } catch {
      toaster.create({
        description: 'An error has occured, please refresh the page',
        type: 'error',
      });
    }
    setSubmitBirdLoading(false);
  };
  return (
    <>
      <Button
        className="addBird"
        open={openNewBird}
        onClick={() => setOpenBird(true)}
        position="fixed"
        bottom="15px"
        right="15px"
        visibility={['visible', 'visible']}
      >
        <FaCrow />
      </Button>
      <Dialog.Root
        open={openNewBird}
        onOpenChange={(e) => setOpenBird(e.openInfo)}
        size="lg"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
	  		Submit a bird
	  {/*<ToggleTip>
			      <Button size="xs" variant="ghost">
				<LuInfo />
			      </Button>
			    </ToggleTip>*/}	
		  <Popover.Root>
		  <Popover.Trigger>
	  <Box  position={"relative"} top={"2px"}left={"5px"}> 
				<LuInfo/>
	  </Box>
		  </Popover.Trigger>
		  <Popover.Positioner>
		    <Popover.Content>
		      <Popover.Body>
	  		<p>Rare bird: 5 points</p>
	  		<p>New species: 2 points</p>
	  		<p>Normal bird: 1 point</p>
		      </Popover.Body>
		    </Popover.Content>
		  </Popover.Positioner>
		</Popover.Root>
	  	</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Login setUid={setUid} setOpenBird={setOpenBird} />
                <FileUpload.Root
                  maxW="xl"
                  alignItems="stretch"
                  onChange={handleFileChange}
                  accept={['image/png', 'image/jpeg', 'image/webp']}
                >
                  <FileUpload.HiddenInput />
                  <FileUpload.Dropzone>
                    <Icon size="md" color="fg.muted">
                      <LuUpload />
                    </Icon>
                    <FileUpload.DropzoneContent>
                      <Box>Drag and drop files here</Box>
                    </FileUpload.DropzoneContent>
                  </FileUpload.Dropzone>
                  <FileUpload.List />
                </FileUpload.Root>

                <BirdSearch
                  bird={bird}
                  setBird={setBird}
                  birdCode={birdCode}
                  setBirdCode={setBirdCode}
                  sciName={sciName}
                  setSciName={setSciName}
                />

                <HStack alignItems="end">
                  <RegionSearch
                    location={location}
                    regCode={regCode}
                    setRegCode={setRegCode}
                    region={region}
                    setRegion={setRegion}
                  />
                  <Map setLocation={setLocation} location={location} />
                </HStack>
                <Button
                  loading={submitBirdLoading}
                  onClick={submitBird}
                  style={{ marginTop: '10px' }}
                >
                  SUBMIT
                </Button>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default AddBird;
