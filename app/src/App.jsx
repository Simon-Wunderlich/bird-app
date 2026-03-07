import { useState, useEffect, useRef } from 'react';
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
import BirdCard from "./BirdCard.jsx"
import Info from "./Info.jsx"
import AddBird from "./AddBird.jsx"
import {
  HiStar,
  HiOutlineRefresh,
  HiOutlinePlus,
} from 'react-icons/hi';
import { LuUpload, LuSearch } from 'react-icons/lu';
import './App.css';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const App = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [uid, setUid] = useState('');

  const fetchData = async () => {
    const response = await fetch('https://birdserver.sorry.horse');
    const result = await response.json();
    result.sort((a, b) => b.points - a.points);
    result.map(user => user.birds.reverse());
    setUsers(result);
  };

  useEffect(() => {
    fetchData();
    const value = localStorage.getItem('uid');
    if (value != null) {
      setUid(value.replaceAll('\n', ''));
    }	
    if (value === "null") {
      localStorage.removeItem("uid");
	}
  }, []);


  const refresh = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };







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
                  <Grid templateColumns={["repeat(1, 1fr)","repeat(3, 1fr)"]}  gap="6" width="100%">
                    {item.birds.map((bird, index) => (
                        <BirdCard bird={bird} uid={uid} fetchData={fetchData} item={item} index={index}/>
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
        <Info/>
      <AddBird setUid={setUid} uid={uid} setUsers={setUsers}/>
    </>
  );
};

export default App;
