import { useState, useEffect } from "react"
import { Combobox, useListCollection, HStack, Spinner, Span} from "@chakra-ui/react"


const RegionSearch = ({location, regCode, setRegCode, region, setRegion}) => {
    const [regLoading, setRegLoading] = useState(false);
    const [regionInput, setRegionInput] = useState('');
  const getRegionFromLoc = async () => {
    const req = await fetch(
     `https://birdserver.sorry.horse/region?latitude=${location.latitude}&longitude=${location.longitude}`
    );
    const council = (await req.json())['council'];
    if (council == null) {
      return;
    }
    const councilName = council['electorateName'].replaceAll(" Rural City Council", "").replaceAll(" Borough Council", "").replaceAll(
      ' City Council',
      ''
    ).replaceAll(' Shire Council', '');
    const response = await fetch(
      `https://api.ebird.org/v2/ref/region/find?key=jfekjedvescr&q=${councilName}`
    );
    const data = await response.json();
    if (data.length == 0) {
      return;
    }
    const ebirdReg = data[0].name.split(', ');
    if (ebirdReg[0] === councilName && ebirdReg[1] === 'Victoria') {
      setRegion(data[0].name);
      setRegCode(data[0].code);
    }
  };
	
	useEffect(() => {
		getRegionFromLoc();
	}, [location]);
  const { collection, set } = useListCollection({
    items: [],
    itemToString: (item) => item.name,
    itemToValue: (item) => item.code,
  });

  useEffect(() => {
    if (regionInput != '') {
      getRegion();
    }
  }, [regionInput]);
  useEffect(() => {
    if (collection.items.length > 0 && region[0] != '') {
      const temp = collection.items.find(
        (_region) => _region.value === region[0]
      );
      if (temp) {
        setRegCode(temp.label);
      }
    }
  }, [region]);

  const getRegion = async () => {
    setRegLoading(true);
    const response = await fetch(
      `https://api.ebird.org/v2/ref/region/find?key=jfekjedvescr&q=${regionInput}`
    );
    setRegLoading(false);
    if (!response.ok) {
      return;
    }
    let data = await response.json();
    const data2 = data.map(({ name: value, ...rest }) => ({ value, ...rest }));
    data = data2.map(({ code: label, ...rest }) => ({ label, ...rest }));
    set(data);
  };
    return (
        <>
        <Combobox.Root
        onInputValueChange={(e) => setRegionInput(e.inputValue)}
        onValueChange={(details) => setRegion(details.value[0])}
        >
        <Combobox.Label>Region</Combobox.Label>

        <Combobox.Control>
        <Combobox.Input placeholder={region} />
        <Combobox.IndicatorGroup>
        <Combobox.ClearTrigger />
        <Combobox.Trigger />
        </Combobox.IndicatorGroup>
        </Combobox.Control>

        <Combobox.Positioner>
        <Combobox.Content>
        {regLoading ? (
            <HStack p="2">
            <Spinner size="xs" borderWidth="1px" />
            <Span>Loading...</Span>
            </HStack>
        ) : (
            collection.items?.map((region) => (
                <Combobox.Item key={region.label} item={region}>
                <Span fontWeight="medium" truncate>
                {region.value}
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

export default RegionSearch;
