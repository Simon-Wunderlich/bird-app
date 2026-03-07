import {useState} from "react"
import {IconButton, Dialog, Portal, Heading, Text } from "@chakra-ui/react"
import { HiOutlineInformationCircle } from 'react-icons/hi';


const Info = () => {
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
        </>
    );
};

export default Info;
