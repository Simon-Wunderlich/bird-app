import { useState, useEffect } from 'react';

function BirdImage({ fileName }) {
  const [text, setText] = useState("");

  useEffect(() => {
    // Use process.env.PUBLIC_URL to ensure the path is correct
    fetch(`/${fileName}`)
      .then(response => response.text())
      .then(data => setText(data))
      .catch(console.error);
  }, [fileName]);

  return <img src={text}/>;
}

export default BirdImage
