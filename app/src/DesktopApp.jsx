import { useState, useEffect, useRef } from 'react'
import { useAsync } from "react-use";
import { Stack, Accordion, Heading, Text, Flex, Spacer, Box, Card, Image, Grid, Show, Badge, IconButton, Dialog, Portal, Link, Input, Button, FileUpload, Icon, InputGroup, Spinner, Field, Combobox, useListCollection, Span, useCombobox, HStack } from "@chakra-ui/react"
import { Toaster, toaster } from "@/src/components/ui/toaster"
import { HiStar, HiOutlineRefresh, HiOutlinePlus, HiOutlineInformationCircle } from "react-icons/hi"
import { LuUpload, LuSearch } from "react-icons/lu"
import './App.css'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const DesktopApp = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [openInfo, setOpenInfo] = useState(false)
    const [openNewBird, setOpenBird] = useState(false)
    const [regLoading, setRegLoading] = useState(false)
    const [birdLoading, setBirdLoading] = useState(false)
    const [region, setRegion] = useState('');
    const [bird, setBird] = useState('');
    const [image, setImage] = useState('');

    const fetchData = async () => {
        const response = await fetch('https://flask-hello-world-tau-dusky.vercel.app/data');
        const result = await response.json();
        result.sort((a,b) => b.points - a.points)
        setUsers(result);
    };

    useEffect(() => {
        fetchData();
    }, [])

    const refresh = async () => {
        setLoading(true);
        fetchData();
        setLoading(false)
    }

  useEffect(() => {
      setBird(['', '']);
      setImage('');
      setRegion('');
      setRegionInput('');
      setBirdInput('');
  }, [openNewBird])

    const [regionInput, setRegionInput] = useState("")
    const [birdInput, setBirdInput] = useState("")
    const [birdList, setBirdList] = useState([])
    const [birdCode, setBirdCode] = useState('')
    const [regCode, setRegCode] = useState('')

  useEffect(() => {
      if (birdInput != "") {
          getBirds();
      }
  }, [birdInput])


    useEffect(() => {
    if (birdList.length > 0 && bird != '') {
        const temp = birdList.find(_bird => _bird.value === bird[0]);
        if (temp) {
            setBirdCode(temp.label)
        }
    }
    }, [bird]);

  const getBirds = async () => {
    setBirdLoading(true);
    const response = await fetch(`https://api.ebird.org/v2/ref/taxon/find?locale=en_US&cat=species&key=jfekjedvescr&q=${birdInput}`)
    setBirdLoading(false);
    if (!response.ok) { return; }
    let data = await response.json()
    const data2 = data.map(({
      name: value,
      ...rest
    }) => ({
      value,
      ...rest
    }));
    data = data2.map(({
      code: label,
      ...rest
    }) => ({
      label,
      ...rest
    }));
    setBirdList(data)
  }
  const { collection, set } = useListCollection({
    items: [],
    itemToString: (item) => item.name,
    itemToValue: (item) => item.code,
  })

  useEffect(() => {
      if (regionInput !="" ) {
          getRegion();
      }
  }, [regionInput])
    useEffect(() => {
    if (collection.items.length > 0 && region[0] != '') {
        const temp = collection.items.find(_region => _region.value === region[0]);
        if (temp) {
            setRegCode(temp.label);
        }
    }
    }, [region]);

  const getRegion = async () => {
    setRegLoading(true);
    const response = await fetch(`https://api.ebird.org/v2/ref/region/find?key=jfekjedvescr&q=${regionInput}`)
    setRegLoading(false);
    if (!response.ok) { return; }
    let data = await response.json()
    const data2 = data.map(({
      name: value,
      ...rest
    }) => ({
      value,
      ...rest
    }));
    data = data2.map(({
      code: label,
      ...rest
    }) => ({
      label,
      ...rest
    }));
    set(data)
  }

    const successHandler = (position) => {
        setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        });
    };

    const errorHandler = (err) => {
        console.log(err.message);
            setLocation({
                latitude: 0,
                longitude: 0,
            });
    };
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
    const [location, setLocation] = useState(null);
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
            setLocation({
                latitude: 0,
                longitude: 0,
            });
        };
        navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
        if (bird == "")    {
             toaster.create({
                description: "Bird is required",
                type: "error",
            });
            return; 
        }
    
        if (region == "")    {
             toaster.create({
                description: "Region is required",
                type: "error",
            });
            return; 
        }
        if (image == "")    {
             toaster.create({
                description: "Image is required",
                type: "error",
            });
            return; 
        }

        setSubmitBirdLoading(true);
        const data = {
            bird: [birdCode, bird[0]],
            region: regCode,
            regionName: region[0],
            image: image,
            lat : location.latitude,
            long : location.longitude,
            uid : "markiplier",
        }
        const response = await fetch('https://flask-hello-world-tau-dusky.vercel.app/submitBird/', {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(data),
        });
        const result = await response.json();
        console.log(typeof(result));
        result.sort((a,b) => b.points - a.points)
        setUsers(result);

        setSubmitBirdLoading(false);
    }
    
    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
          const uploadedFile = files[0];
            const reader = new FileReader();

            reader.onload = async (event) => {
                const fileData = event.target.result;
                setImage(fileData);
                console.log(image);
            };
            reader.readAsDataURL(uploadedFile);
        }
      };

  return (
      <>
	  <BirdImage fileName="markipliertruswaOM-BU.txt" />
      <Stack gap="2" align="center">
        <Heading size="5xl">Leaderbird</Heading>
        <Accordion.Root collapsible variant="enclosed">
          {users.map((item, index) => (
          <Accordion.Item key={index} value={item.username}>
            <Accordion.ItemTrigger>
              <Flex gap ="1" width="100%" padding="15px 0">
                <Text textStyle="2xl"> {index + 1}. </Text>
                <Text textStyle="2xl" truncate> {item.username} </Text>
                <Spacer />
                <Text textStyle="2xl" fontWeight="bold">{item.points}</Text>
                <Text textStyle="lg" alignSelf="end"> pts</Text>
                <Accordion.ItemIndicator alignContent="center" />
              </Flex>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Stack gap="2" align="center">
              <Box display="flex" spaceX="8">
                  <div>
                    <Text textStyle="2xl" fontWeight="bold">{Object.values(item.birdCounts).length}</Text>
                    <Text textStyle="lg" alignSelf="end"> unique species</Text>
                  </div>
                  <div>
                    <Text textStyle="2xl" fontWeight="bold">{item.birds.length}</Text>
                    <Text textStyle="lg" alignSelf="end"> total observations</Text>
                  </div>
              </Box>
              <Grid templateColumns="repeat(3, 1fr)" gap="6" width="100%">
              {Object.keys(item.birds).map((bird, index) => (
                  <Card.Root flexDirection="row" size = "sm" align="center"  key = {index} position="relative">
                    <Dialog.Root placement = "center" size="xs">
                        <Dialog.Trigger asChild>
                            <Box aspectRatio="square" backgroundImage={item.birds[index].image} backgroundPosition="center" backgroundSize="cover" borderRadius="0.375rem 0 0 0.375rem"/>
                        </Dialog.Trigger>
                        <Portal>
                            <Dialog.Backdrop />
                              <Dialog.Positioner>
                                <Dialog.Content>
                                  <Dialog.Header/>
                                  <Dialog.Body>
                                    <Image src = {item.birds[index].image} />
                                  </Dialog.Body>
                                 </Dialog.Content>
                              </Dialog.Positioner>
                        </Portal>
                      </Dialog.Root>
                    <Card.Body>
                        <Card.Title mb="2" whiteSpace="nowrap" overflow = "hidden" display = "block" textOverflow = "ellipsis" width="250px">{item.birds[index].bird}</Card.Title>
                        <Card.Description whiteSpace= "nowrap" overflow = "hidden" display = "block" textOverflow = "ellipsis" width="250px">{item.birds[index].location}</Card.Description>
                    </Card.Body>
                  <Show when={item.birds[index].isRare}>
                      <Badge variant="solid" colorPalette="blue" position = "absolute" top="0" left="0">
                      <HiStar />
                      Rare
                      </Badge>
                  </Show>
                </Card.Root>
              ))}
              </Grid>
              </Stack>
              <Accordion.ItemBody />
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
        </Accordion.Root>
      </Stack>
      <Stack direction = "row" position = "absolute" top = "0" right="0" padding="15px">
          <IconButton loading={loading} variant="surface" onClick={refresh}>
            <HiOutlineRefresh />
          </IconButton>
      </Stack>
      <IconButton onClick = {() => setOpenInfo(true)} variant = "surface" position="absolute" top = "15px" left = "15px">
        <HiOutlineInformationCircle />
      </IconButton>
      <Dialog.Root open={openInfo} onOpenChange={(e) => setOpenInfo(e.openInfo)} size="lg">
          <Portal>
            <Dialog.Backdrop/>
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>
                        How to play
                    </Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                    <Heading marginTop = "30px">Rules</Heading>
                    <Text>
                        Each bird is worth 1 point. Rare birds are worth 5 points. If you submit a bird within 100m of a bird of the same species that you have already submitted, it will not count. Likewise if you do not attatch a photo to your sighting via eBird it will not count.
      </Text>
          <Heading>
          Resources
          </Heading>
          <Text>
          The Merlin Bird ID app is useful for identifying birds you don't recognise. You can use images, sound recordings, or step by step identification.
          </Text>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

      <Button className="addBird" open={openNewBird} onClick = {() => setOpenBird(true)} position="absolute" bottom = "15px" right = "15px">
       BIRD
      </Button>
      <Dialog.Root open = {openNewBird} onOpenChange={(e) => setOpenBird(e.openInfo)} size="lg">
        <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>
                            Submit a bird
                        </Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <FileUpload.Root maxW="xl" alignItems="stretch" onChange={handleFileChange} accept={["image/png", "image/jpeg", "image/webp"]}>
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

                        <Combobox.Root onInputValueChange={(e) => setBirdInput(e.inputValue)} onValueChange={(details) => setBird(details.value)}>
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
                        <Combobox.Root onInputValueChange={(e) => setRegionInput(e.inputValue)} onValueChange={(details) => setRegion(details.value)}>
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
                        <Button loading={submitBirdLoading} onClick={submitBird}>
                            SUBMIT
                        </Button>
                </Dialog.Body>
              </Dialog.Content>
          </Dialog.Positioner>
      </Portal>
                        
      </Dialog.Root>
      <Toaster />
      </>
  );
}

export default DesktopApp

