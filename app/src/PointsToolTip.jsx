import {
  Popover as ChakraPopover,
  Portal,
  VStack,
} from "@chakra-ui/react"
import * as React from "react"
import { HiOutlineInformationCircle } from "react-icons/hi"

export default function ToggleTip() {

    return (
      <Popover.Root
        {...rest}
        positioning={{ ...rest.positioning, gutter: 4 }}
      >
        <Popover.Trigger asChild>{children}</Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content
              width="auto"
              px="2"
              py="1"
              textStyle="xs"
              rounded="sm"
            >
	    <VStack>
	    <p>Rare bird: 5 points</p>
	    <p>New species: 2 points</p>
	    <p>Normal bird: 1 point</p>
	    </VStack>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    )
  }
