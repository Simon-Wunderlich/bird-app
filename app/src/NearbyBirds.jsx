import { useEffect, useState } from 'react';
import {
  IconButton,
  Dialog,
  Portal,
  Text,
  Alert,
  Input,
  Stack,
  InputGroup,
  ButtonGroup,
  Pagination,
} from '@chakra-ui/react';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { LuChevronLeft, LuChevronRight, LuSearch } from 'react-icons/lu';
import {search} from "fast-fuzzy"

const pageSize = 20;

let formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const NearbyBirds = ({user}) => {
  const [birdList, setBirdList] = useState([])
  const [pagedBirdList, setPagedBirdList] = useState([])
  const [error, setError] = useState(null)
  const [input, setInput] = useState("")
  const [page, setPage] = useState(1)

  const startRange = (page - 1) * pageSize
  const endRange = startRange + pageSize
  const successHandler = (position) => {
    const lat = formatter.format(position.coords.latitude)
    const long = formatter.format(position.coords.longitude)
    const area = `${lat},${long}`
    const nearbyBirds = user.birds
      .filter((_) => _.area == area)
      .map((_) => _.name);
    setBirdList(nearbyBirds)
    console.log(area)
    const slicedBirds = nearbyBirds.slice(startRange, endRange)
    setPagedBirdList(slicedBirds)
  }

  const errorHandler = async () => {
    setError("Failed to get location")
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
  }, []);

  useEffect(() => {
    console.log(input)
    if (input == ""){
      console.log(birdList)
      const slicedBirds = birdList.slice(0, pageSize);
      setPagedBirdList(slicedBirds);
      return;
    }

    console.log(birdList)
    const searchedBirds = search(input, birdList)
    console.log(birdList)
    const slicedBirds = searchedBirds.slice(0, pageSize);
    setPagedBirdList(slicedBirds);
  }, [input]);

  const [openInfo, setOpenInfo] = useState(false);
    return (
      <>
        <IconButton
          onClick={() => setOpenInfo(true)}
          variant="surface"
          position="absolute"
          top="15px"
          left="15px"
        >
          <HiOutlineStatusOnline />
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
                  <Dialog.Title>My birds in this area</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  {' '}
                  {error ? (
                    <Alert.Root status="error">
                      <Alert.Indicator />
                      <Alert.Title>{error}</Alert.Title>
                    </Alert.Root>
                  ) : (
                    <>
                      <InputGroup flex="1" startElement={<LuSearch />}>
                        <Input placeholder="Search birds" onInput={(e) => setInput(e.target.value)}/>
                      </InputGroup>
                      <Stack gap="2" padding={"15px"}>
                        <Stack gap="4">
                          {pagedBirdList.map((bird) => (
                            <Text key={bird}>{bird}</Text>
                          ))}
                        </Stack>
                      <Pagination.Root
                        count={pagedBirdList.length}
                        pageSize={pageSize}
                        page={page}
                        onPageChange={(e) => setPage(e.page)}
                      >
                        <ButtonGroup variant="ghost">
                          <Pagination.PrevTrigger asChild>
                            <IconButton>
                              <LuChevronLeft />
                            </IconButton>
                          </Pagination.PrevTrigger>

                          <Pagination.Items
                            render={(page) => (
                              <IconButton
                                variant={{
                                  base: 'ghost',
                                  _selected: 'outline',
                                }}
                              >
                                {page.value}
                              </IconButton>
                            )}
                          />

                          <Pagination.NextTrigger asChild>
                            <IconButton>
                              <LuChevronRight />
                            </IconButton>
                          </Pagination.NextTrigger>
                        </ButtonGroup>
                      </Pagination.Root>
                      </Stack>
                    </>
                  )}
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </>
    );
};

export default NearbyBirds;
