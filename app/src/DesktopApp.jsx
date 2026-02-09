import { useState, useEffect } from 'react'
import { Stack, Accordion, Heading, Text, Flex, Spacer, Box, Card, Image, Grid, Show, Badge } from "@chakra-ui/react"
import { HiStar } from "react-icons/hi"
import './App.css'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function DesktopApp() {
  const [users, setUsers] = useState([])
  const fetchCache = async () => {
    const response = await fetch('http://base.sorry.horse:8000/all/QUICK');
    const result = await response.json();
    result.sort((a,b) => b.points - a.points)
    setUsers(result);
    fetchData();
  };
  const fetchData = async () => {
    const response = await fetch('http://base.sorry.horse:8000/all/SLOW');
    const result = await response.json();
    result.sort((a,b) => b.points - a.points)
    setUsers(result);
  };
    useEffect(() => {
        fetchCache();
    }, []);
  return (
      <>
      <Stack gap="2" align="center">
        <Heading size="5xl">Bird app</Heading>
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
                  <Card.Root flexDirection="row" size = "sm" align="center"  key = {index}>
                    <Box aspectRatio="square" backgroundImage={"url(" + item.birds[index].image + ")"} backgroundPosition="bottom" backgroundSize="cover" borderRadius="0.375rem 0 0 0.375rem"/>
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
      </>
  );
}

export default DesktopApp

