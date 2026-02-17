import { useState, useEffect, useRef } from 'react';
import { Toaster, toaster } from '@/src/components/ui/toaster';
import {
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
} from '@chakra-ui/react';

const Login = ({ setUid, setOpenBird }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const value = localStorage.getItem('uid');
    if (value == null) {
      setOpen(true);
    } else {
      setUid(value.replaceAll('\n', ''));
    }
  }, []);

  const submit = async () => {
    if (name === '') {
      toaster.create({ description: 'Name cannot be blank', type: 'error' });
      return;
    }
    setLoading(true);
    const response = await fetch(
      'https://base.sorry.horse:8000/register/' + name
    );
    const result = await response.text();
    localStorage.setItem('uid', result);
    setUid(result);
    setOpen(false);
    setLoading(false);
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(e) => setOpenBird(e.openInfo)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Set your username</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Input onChange={(event) => setName(event.target.value)} />
                <Button
                  loading={loading}
                  onClick={submit}
                  style={{ marginTop: '10px' }}
                >
                  Go
                </Button>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      <Toaster />
    </>
  );
};

export default Login;
