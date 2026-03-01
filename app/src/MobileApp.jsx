import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import { useAsync } from 'react-use';
import {
	Float,
  Stack,
  Accordion,
  Heading,
  Text,
  Flex,
  Spacer,
  Box,
  Card,
  Image,
  Grid,
  Show,
  Badge,
  IconButton,
  Dialog,
  Portal,
  Link,
  Input,
  Button,
  FileUpload,
  Icon,
  InputGroup,
  Spinner,
  Field,
  Combobox,
  useListCollection,
  Span,
  useCombobox,
  HStack,
  VStack
} from '@chakra-ui/react';
import Login from './Login.jsx';
import { Toaster, toaster } from '@/src/components/ui/toaster';
import {
  HiStar,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlineInformationCircle,
} from 'react-icons/hi';
import { LuUpload, LuSearch } from 'react-icons/lu';
import { FaCrow, FaLocationDot, FaTrashCan } from 'react-icons/fa6';
import './App.css';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MobileApp = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [openNewBird, setOpenBird] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [birdLoading, setBirdLoading] = useState(false);
  const [region, setRegion] = useState('');
  const [bird, setBird] = useState('');
  const [marker, setMarker] = useState([-37.8136, 144.9631]);
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState('');
  const [uid, setUid] = useState('');

  const fetchData = async () => {
    const response = await fetch('https://birdserver.sorry.horse');
    const result = await response.json();
    result.sort((a, b) => b.points - a.points);
    result.map(user => user.birds.reverse());
    setUsers(result);
  };

  const setLocationFromMarker = () => {
    console.log(marker);
    setLocation({ latitude: marker.lat, longitude: marker.lng });
    setOpenMap(false);
  };
  useEffect(() => {
    fetchData();
    const successHandler = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setMarker([position.coords.latitude, position.coords.longitude]);
    };
    const errorHandler = async (err) => {
      console.log(err.message);
      setLocation({ latitude: 0, longitude: 0 });
      const timer = setTimeout(() => {}, 100);
      return () => clearTimeout(timer);
    };
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
    const value = localStorage.getItem('uid');
    if (value != null) {
      setUid(value.replaceAll('\n', ''));
    }
  }, []);

  const getRegionFromLoc = async () => {
    const req = await fetch(
     `https://birdserver.sorry.horse/region?latitude=${location.latitude}&longitude=${location.longitude}`
    );
    const council = (await req.json())['council'];
    if (council == null) {
      return;
    }
    const councilName = council['electorateName'].replaceAll(" Rural City Council", "").replaceAll(" Borough Council", "").replaceAll(
      ' City Council',
      ''
    ).replaceAll(' Shire Council', '');
    const response = await fetch(
      `https://api.ebird.org/v2/ref/region/find?key=jfekjedvescr&q=${councilName}`
    );
    const data = await response.json();
    if (data.length == 0) {
      return;
    }
    const ebirdReg = data[0].name.split(', ');
    if (ebirdReg[0] === councilName && ebirdReg[1] === 'Victoria') {
      setRegion(data[0].name);
      setRegCode(data[0].code);
    }
  };
	
	useEffect(() => {
		getRegionFromLoc();
	}, [location]);

  const refresh = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  const handleClick = (event) => {
    const { lat, lng } = event.latlng;
    console.log(lat);
    setMarker([lat, lng]);
  };

  useEffect(() => {
    setBird('');
    setImage('');
    setRegionInput('');
    setBirdInput('');
  }, [openNewBird]);

  const [regionInput, setRegionInput] = useState('');
  const [birdInput, setBirdInput] = useState('');
  const [birdList, setBirdList] = useState([]);
  const [birdCode, setBirdCode] = useState('');
  const [regCode, setRegCode] = useState('');
  const [sciName, setSciName] = useState("");
 
  useEffect(() => {
    if (birdInput != '') {
      getBirds();
    }
  }, [birdInput]);

  useEffect(() => {
    if (birdList.length > 0 && bird != '') {
      const temp = birdList.find((_bird) => _bird.value === bird[0]);
      if (temp) {
        setBirdCode(temp.label);
	console.log(temp.label);
	setSciName(temp.sciName);
      }
    }
  }, [bird]);

  const getBirds = async () => {
    setBirdLoading(true);
    const response = await fetch(
      `https://api.ebird.org/v2/ref/taxon/find?locale=en_US&cat=species&key=jfekjedvescr&q=${birdInput}`
    );
    setBirdLoading(false);
    if (!response.ok) {
      return;
    }
    let data = await response.json();
    const data2 = data.map(({ name: value, ...rest }) => ({ value, ...rest }));
    data = data2.map(({ code: label, ...rest }) => ({ label, ...rest }));
    data.forEach((obj) => {
      obj.sciName = obj.value.split(" - ")[1];
      obj.value = obj.value.split(' - ')[0];
    });
    setBirdList(data);
  };
  const { collection, set } = useListCollection({
    items: [],
    itemToString: (item) => item.name,
    itemToValue: (item) => item.code,
  });

  useEffect(() => {
    if (regionInput != '') {
      getRegion();
    }
  }, [regionInput]);
  useEffect(() => {
    if (collection.items.length > 0 && region[0] != '') {
      const temp = collection.items.find(
        (_region) => _region.value === region[0]
      );
      if (temp) {
        setRegCode(temp.label);
      }
    }
  }, [region]);

  const getRegion = async () => {
    setRegLoading(true);
    const response = await fetch(
      `https://api.ebird.org/v2/ref/region/find?key=jfekjedvescr&q=${regionInput}`
    );
    setRegLoading(false);
    if (!response.ok) {
      return;
    }
    let data = await response.json();
    const data2 = data.map(({ name: value, ...rest }) => ({ value, ...rest }));
    data = data2.map(({ code: label, ...rest }) => ({ label, ...rest }));
    set(data);
  };

  const [submitBirdLoading, setSubmitBirdLoading] = useState(false);
  const submitBird = async () => {
    const successHandler = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    const errorHandler = (err) => {
      console.log(err.message);
      setLocation({ latitude: 0, longitude: 0 });
    };
    if (marker == [-37.8136, 144.9631]) {
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
    if (typeof result == "string") {
      toaster.create({ description: result, type: 'error' });
      setSubmitBirdLoading(false);
      return;
    }
    result.sort((a, b) => b.points - a.points);
    result.map(user => user.birds.reverse());
    setUsers(result);

    setOpenBird(false);
    setSubmitBirdLoading(false);
  };

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

  const deleteBird = async (id, item) => {
	await fetch("https://birdserver.sorry.horse/delete/" + id.slice(1));
	await fetchData();
  }

  const [progress, setProgress] = useState(0);
  return (
    <>
      <Stack gap="2" align="center">
        <Heading size="5xl">Leaderbird</Heading>
        <Accordion.Root collapsible variant="enclosed">
          {users.map((item, index) => (
            <Show when={item.points > 0} >
            <Accordion.Item key={index} value={item.username}>
              <Accordion.ItemTrigger>
                <Flex gap="1" width="100%" padding="15px 0">
                  <Text textStyle="2xl"> {index + 1}. </Text>
                  <Text textStyle="2xl" truncate>
                    {' '}
                    {item.username}{' '}
                  </Text>
                  <Spacer />
                  <Text textStyle="2xl" fontWeight="bold">
                    {item.points}
                  </Text>
                  <Text textStyle="lg" alignSelf="end">
                    {' '}
                    pts
                  </Text>
                  <Accordion.ItemIndicator alignContent="center" />
                </Flex>
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Stack gap="2" align="center">
                  <Box display="flex" spaceX="8">
                    <div>
                      <Text textStyle="2xl" fontWeight="bold">
                        {Object.values(item.birdCounts).length}
                      </Text>
                      <Text textStyle="lg" alignSelf="end">
                        {' '}
                        unique species
                      </Text>
                    </div>
                    <div>
                      <Text textStyle="2xl" fontWeight="bold">
                        {item.birds.length}
                      </Text>
                      <Text textStyle="lg" alignSelf="end">
                        {' '}
                        total observations
                      </Text>
                    </div>
                  </Box>
                  <Grid templateColumns="repeat(1, 1fr)" gap="6" width="100%">
                    {item.birds.map((bird, index) => (
                      <Card.Root
                        flexDirection="column"
                        size="sm"
                        align="center"
                        key={index}
                      >
                        <Dialog.Root placement="center" size="xs">
                          <Dialog.Trigger asChild>
                            <Box
                              aspectRatio="square"
                              backgroundImage={
                                'url(https://birdfiles.sorry.horse' +
                                bird.image +
                                ')'
                              }
                              backgroundPosition="center"
                              backgroundSize="cover"
                              borderRadius="0.375rem 0.375rem 0 0"
                            />
                          </Dialog.Trigger>
                          <Portal>
                            <Dialog.Backdrop />
                            <Dialog.Positioner>
                              <Dialog.Content width="75vw">
                                <Dialog.Header>
			    <VStack alignItems="start">
                                  <Dialog.Title>
                                    {bird.name}
                                  </Dialog.Title>
			    <Text>
			    {bird.sciName}
			    </Text>
			    </VStack>
                                </Dialog.Header>
                                <Dialog.Body>
                                  <Image
                                    src={
                                      'https://birdfiles.sorry.horse' +
                                      bird.image
                                    }
                                  />
                                </Dialog.Body>
                              </Dialog.Content>
                            </Dialog.Positioner>
                          </Portal>
                        </Dialog.Root>
                        <Card.Body>
                          <Card.Title
                            mb="2"
                            whiteSpace="wrap"
                            overflow="hidden"
                            display="block"
                            textOverflow="ellipsis"
                            width="auto"
                          >
                            {bird.name}
                          </Card.Title>
                          <Card.Description
                            whiteSpace="nowrap"
                            overflow="hidden"
                            display="block"
                            textOverflow="ellipsis"
                            width="auto"
                          >
                            {bird.region}
                          </Card.Description>
                        </Card.Body>
                        <Show when={bird.isRare}>
                          <Badge
                            variant="solid"
                            colorPalette="blue"
                            padding="5px"
                            width="fit-content"
                            position="absolute"
                            top="0"
                            left="0"
                          >
                            <HiStar />
                            Rare
                          </Badge>
                        </Show>
			    <Show when={uid == item.uid} >
			    <Float offsetX="4" offsetY="4">
			    	<IconButton variant="surface" onClick={() => deleteBird(bird.image, item)}>
			    		<FaTrashCan />
			    	</IconButton>
			    </Float>
			    </Show>
                      </Card.Root>
                    ))}
                  </Grid>
                </Stack>
                <Accordion.ItemBody />
              </Accordion.ItemContent>
            </Accordion.Item>
		</Show>
          ))}
        </Accordion.Root>
      </Stack>
      <Stack
        direction="row"
        position="absolute"
        top="0"
        right="0"
        padding="15px"
      >
        <IconButton loading={loading} variant="surface" onClick={refresh}>
          <HiOutlineRefresh />
        </IconButton>
      </Stack>
      <IconButton
        onClick={() => setOpenInfo(true)}
        variant="surface"
        position="absolute"
        top="15px"
        left="15px"
      >
        <HiOutlineInformationCircle />
      </IconButton>
      <Dialog.Root
        open={openInfo}
        onOpenChange={(e) => setOpenInfo(e.openInfo)}
        size="lg"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>How to play</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Heading marginTop="30px">Rules</Heading>
                <Text>
                  Each bird is worth 1 point. Rare birds are worth 5 points. If
                  you submit a bird within 1km of a bird of the same species
                  that you have already submitted, it will not count.
                </Text>
                <Heading>Resources</Heading>
                <Text>
                  The Merlin Bird ID app is useful for identifying birds you
                  don't recognise. You can use images, sound recordings, or step
                  by step identification.
                </Text>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Button
        className="addBird"
        open={openNewBird}
        onClick={() => setOpenBird(true)}
        position="fixed"
        bottom="15px"
        right="15px"
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
                <Dialog.Title>Submit a bird</Dialog.Title>
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

                <Combobox.Root
                  onInputValueChange={(e) => setBirdInput(e.inputValue)}
                  onValueChange={(details) => setBird(details.value)}
                >
                  <Combobox.Label>Bird</Combobox.Label>

                  <Combobox.Control>
                    <Combobox.Input placeholder={bird} />
                    <Combobox.IndicatorGroup>
                      <Combobox.ClearTrigger />
                      <Combobox.Trigger />
                    </Combobox.IndicatorGroup>
                  </Combobox.Control>

                  <Combobox.Positioner>
                    <Combobox.Content>
                      {birdLoading ? (
                        <HStack p="2">
                          <Spinner size="xs" borderWidth="1px" />
                          <Span>Loading...</Span>
                        </HStack>
                      ) : (
                        birdList?.map((bird) => (
                          <Combobox.Item key={bird.label} item={bird}>
                            <Span fontWeight="medium" truncate>
                              {bird.value}
                            </Span>
                            <Combobox.ItemIndicator />
                          </Combobox.Item>
                        ))
                      )}
                    </Combobox.Content>
                  </Combobox.Positioner>
                </Combobox.Root>
                <HStack alignItems="end">
                  <Combobox.Root
                    onInputValueChange={(e) => setRegionInput(e.inputValue)}
                    onValueChange={(details) => setRegion(details.value[0])}
                  >
                    <Combobox.Label>Region</Combobox.Label>

                    <Combobox.Control>
                      <Combobox.Input placeholder={region} />
                      <Combobox.IndicatorGroup>
                        <Combobox.ClearTrigger />
                        <Combobox.Trigger />
                      </Combobox.IndicatorGroup>
                    </Combobox.Control>

                    <Combobox.Positioner>
                      <Combobox.Content>
                        {regLoading ? (
                          <HStack p="2">
                            <Spinner size="xs" borderWidth="1px" />
                            <Span>Loading...</Span>
                          </HStack>
                        ) : (
                          collection.items?.map((region) => (
                            <Combobox.Item key={region.label} item={region}>
                              <Span fontWeight="medium" truncate>
                                {region.value}
                              </Span>
                              <Combobox.ItemIndicator />
                            </Combobox.Item>
                          ))
                        )}
                      </Combobox.Content>
                    </Combobox.Positioner>
                  </Combobox.Root>
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
                </HStack>
                <Button
                  loading={submitBirdLoading}
                  onClick={submitBird}
                  style={{ marginTop: '10px' }}
                >
                  SUBMIT
                </Button>
                <Show when={progress > 0}>
                  <Text
                    show
                    display="inline"
                    textStyle="sm"
                    position="relative"
                    top="5px"
                    padding="10px"
                  >
                    {progress}%
                  </Text>
                </Show>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

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
export default MobileApp;
