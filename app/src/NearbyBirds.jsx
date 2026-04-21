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

const pageSize = 10;

let formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const NearbyBirds = ({user}) => {
  const [birdList, setBirdList] = useState([])
  const [searchResult, setSearchResult] = useState([])
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
    console.log(position.coords.longitude)
    console.log(user.birds)
    setBirdList(nearbyBirds)
    setSearchResult(nearbyBirds)
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
      setPage(1)
      setSearchResult(birdList);
      return;
    }

    setPage(1);
    const searchedBirds = search(input, birdList)
    setSearchResult(searchedBirds);
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
                          {searchResult.length > 0 ? searchResult.slice(startRange, endRange).map((bird) => (
                            <Text key={bird}>{bird}</Text>
                          )) :
                            <Text>No birds :(</Text>}
                        </Stack>
                      <Pagination.Root
                        count={searchResult.length}
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
