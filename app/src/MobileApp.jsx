import { useState, useEffect } from 'react'
import { Stack, Accordion, Heading, Text, Flex, Spacer, Box, Card, Image, Grid, Show, Badge, IconButton, Dialog, Portal, Link, Input, Button } from "@chakra-ui/react"
import { Toaster, toaster } from "@/src/components/ui/toaster"
import { HiStar, HiOutlineRefresh, HiOutlinePlus, HiOutlineInformationCircle } from "react-icons/hi"
import './App.css'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const MobileApp = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [regLoading, setRegLoading] = useState(false)
    const [ profile, setProfile ] = useState('')
    const [open, setOpen] = useState(false)
    const [openInfo, setOpenInfo] = useState(false)

    const fetchCache = async () => {
        const response = await fetch('http://192.168.1.100:8000/all/QUICK');
        const result = await response.json();
        result.sort((a,b) => b.points - a.points)
        setUsers(result);
        fetchData();
    };
    const fetchData = async () => {
        const response = await fetch('http://192.168.1.100:8000/all/SLOW');
        const result = await response.json();
        result.sort((a,b) => b.points - a.points)
        setUsers(result);
    };
    useEffect(() => {
        fetchCache();
    }, []);


    const refresh = async () => {
        setLoading(true);
        const response = await fetch('http://192.168.1.100:8000/all/SLOW');
        const result = await response.json();
        result.sort((a,b) => b.points - a.points)
        setUsers(result);
        setLoading(false)
    }

    const handleChange = (event) => {
        setProfile(event.target.value);
    };

    const attemptRegister = async () => {
        setRegLoading(true);
        const userId = profile.match("profile/(.+?)/world")[1]
        const response = await fetch('http://192.168.1.100:8000/' + userId);
        if (!response.ok){
            toaster.create({
                description: "Cannot find user",
                type: "error",
            });
            setRegLoading(false);
            setOpen(false);
            return;
        }
        const result = await response.json();
        if (users.map(user => user.username).includes(result.username)){
            toaster.create({
                description: "User already registered",
                type: "error",
            });
            setRegLoading(false);
            setOpen(false);
            return;
        }
        const _users = users;
        _users.push(result);
        _users.sort((a,b) => b.points - a.points)

        toaster.create({
            description: "User successfully added",
            type: "success",
        });
        setUsers(_users);
        setRegLoading(false);
        setOpen(false);
    }

  return (
      <>
      <Stack gap="2" align="center">
        <Heading size="7xl">Leaderbird</Heading>
        <Accordion.Root collapsible variant="enclosed">
          {users.map((item, index) => (
          <Accordion.Item key={index} value={item.username}>
            <Accordion.ItemTrigger>
              <Flex gap ="1" width="100%" padding="15px 0">
                <Text textStyle="5xl"> {index + 1}. </Text>
                <Text textStyle="5xl" truncate> {item.username} </Text>
                <Spacer />
                <Text textStyle="5xl" fontWeight="bold">{item.points}</Text>
                <Text textStyle="2xl" alignSelf="end"> pts</Text>
                <Accordion.ItemIndicator alignContent="center" />
              </Flex>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Stack gap="2" align="center">
              <Box display="flex" spaceX="8">
                  <div>
                    <Text textStyle="5xl" fontWeight="bold">{Object.values(item.birds).length}</Text>
                    <Text textStyle="2xl" alignSelf="end"> unique species</Text>
                  </div>
                  <div>
                    <Text textStyle="5xl" fontWeight="bold">{item.birds.length}</Text>
                    <Text textStyle="2xl" alignSelf="end"> total observations</Text>
                  </div>
              </Box>
              <Grid templateColumns="repeat(1, 1fr)" gap="6" width="100%">
              {Object.keys(item.birds).map((bird, index) => (
                  <Card.Root flexDirection="column" size = "sm" align="center"  key = {index}>
                    <Dialog.Root placement = "center" size="xs">
                        <Dialog.Trigger asChild>
                              <Box aspectRatio="square" backgroundImage={"url(" + item.birds[index].image + ")"} backgroundPosition="center" backgroundSize="cover" borderRadius="0.375rem 0.375rem 0 0"/>
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
                        <Card.Title mb="2" whiteSpace= "wrap" overflow = "hidden" display = "block" textStyle="4xl" textOverflow = "ellipsis" width="auto">{item.birds[index].bird}</Card.Title>
                        <Card.Description whiteSpace= "nowrap" overflow = "hidden" display = "block" textStyle="2xl" textOverflow = "ellipsis" width="auto">{item.birds[index].location}</Card.Description>
                    </Card.Body>
                  <Show when={item.birds[index].isRare}>
                  <Badge variant="solid" colorPalette="blue" textStyle="4xl" padding="5px" width="fit-content" position = "absolute" top="0" left="0">
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
          <IconButton onClick = {() => setOpen(true)} variant = "surface">
            <HiOutlinePlus />
          </IconButton>
          <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
          <Portal>
            <Dialog.Backdrop/>
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>
                        Register your eBird account
                    </Dialog.Title>
                </Dialog.Header>
                <Dialog.Body gap>
                    <Text>Visit your <Link variant="underline" href="https://ebird.org/profile" colorPalette="teal" target="_blank"> eBird profile</Link> and copy the url into the field below</Text>
                      <Input placeholder="https://ebird.org/profile/<USER ID>/world" margin = "10px 0 0 0 " onChange={handleChange} />
                </Dialog.Body>
                <Dialog.Footer>
                    <Button onClick={attemptRegister} loading = {regLoading}>Ok</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
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
                    <Heading>
                        Getting started
                    </Heading>
                    <Text>
                        Download the Merlin Bird ID app and the eBird app. You will use eBird to submit any sightings and can use merlin to help with identification. Sign in to both apps with the same account. 
                    </Text>
                    <Heading marginTop = "30px">Configuration</Heading>
                    <Text>
                        Change the "How to save your sightings" setting in Merlin to "Use eBird". On the <Link variant="underline" href="https://ebird.org/profile" colorPalette="teal" target="_blank">ebird website</Link>, edit your profile and ensure you have enabled "Make my profile public" and "Show my latest checklists"
                    </Text>
                    <Heading marginTop = "30px">Submitting birds</Heading>
                    <Text whiteSpace="pre-line">
      {'Bird submissions are done through eBird. To submit a bird, select "start checklist" and enter any and all birds you have found. \nOnce you have finished entering your birds, click stop. On the next screen, click "choose your location" and use the auto selected location. Click submit. \nNavigate to you checklist in the checklist page and click the arrow button in the top right corner to go to the website. To add photos, click Add media in the blue edit dropdown then upload photos for each of your birds. Once submitted to ebird, your birds will take some time to show up on the leaderbird.'}
                    </Text>
                    <Heading marginTop = "30px">Rules</Heading>
                    <Text>
                        Each bird is worth 1 point. Rare birds are worth 5 points. If you submit a bird within 100m of a bird of the same species that you have already submitted, it will not count. Likewise if you do not attatch a photo to your sighting via eBird it will not count.
      </Text>
      <Text marginTop = "30px">
      Click the + icon to register once you are all set up
      </Text>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </>
  );
}

export default MobileApp

