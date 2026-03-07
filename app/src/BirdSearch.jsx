
import { Combobox, HStack, Spinner, Span } from "@chakra-ui/react"
import { useState, useEffect } from "react"
const BirdSearch = ({bird, setBird, birdCode, setBirdCode, sciName, setSciName}) => {
  const [birdLoading, setBirdLoading] = useState(false);
  const [birdInput, setBirdInput] = useState('');
  const [birdList, setBirdList] = useState([]);
 
  useEffect(() => {
    if (birdInput != '') {
      getBirds();
    }
  }, [birdInput]);

  useEffect(() => {
    if (birdList.length > 0 && bird != '') {
      const temp = birdList.find((_bird) => _bird.value === bird[0]);
      if (temp) {
        setBirdCode(temp.label);
	console.log(temp.label);
	setSciName(temp.sciName);
      }
    }
  }, [bird]);

  const getBirds = async () => {
    setBirdLoading(true);
    const response = await fetch(
      `https://api.ebird.org/v2/ref/taxon/find?locale=en_US&cat=species&key=jfekjedvescr&q=${birdInput}`
    );
    setBirdLoading(false);
    if (!response.ok) {
      return;
    }
    let data = await response.json();
    const data2 = data.map(({ name: value, ...rest }) => ({ value, ...rest }));
    data = data2.map(({ code: label, ...rest }) => ({ label, ...rest }));
    data.forEach((obj) => {
      obj.sciName = obj.value.split(" - ")[1];
      obj.value = obj.value.split(' - ')[0];
    });
    setBirdList(data);
  };
    return (
        <>
        <Combobox.Root
        onInputValueChange={(e) => setBirdInput(e.inputValue)}
        onValueChange={(details) => setBird(details.value)}
        >
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
        </>
    )
};

export default BirdSearch;
