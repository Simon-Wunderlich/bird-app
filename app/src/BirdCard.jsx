import { useState, useEffect, useRef } from 'react';
import { Toaster, toaster } from '@/src/components/ui/toaster';
import {
    VStack,
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
    Float
} from '@chakra-ui/react';

import {
  HiStar,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlineInformationCircle,
} from 'react-icons/hi';

import { FaCrow, FaLocationDot, FaTrashCan } from 'react-icons/fa6';
const BirdCard = ({ bird, uid, fetchData, index, item }) => {
  const deleteBird = async (id) => {
	await fetch("https://birdserver.sorry.horse/delete/" + id.slice(1));
	await fetchData();
  }
    return (
    <>
        <Card.Root
        flexDirection={["column", "row"]}
    size="sm"
        align="center"
        key={index}
    position="relative"
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
                    borderRadius={["0.375rem 0.375rem 0 0", "0.375rem 0 0 0.375rem"]}
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
                        <IconButton variant="surface" onClick={() => deleteBird(bird.image)}>
                        <FaTrashCan />
                        </IconButton>
                        </Float>
                        </Show>
                        </Card.Root>
    </>
    );
    };

export default BirdCard;
