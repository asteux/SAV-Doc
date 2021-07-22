import React, { useEffect, useState } from "react";

const AudioViewer = ({ file, fileType, height }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    (async () => {
      setSrc(URL.createObjectURL(file));
    })();
  }, [file]);

  return (
    <>
      <audio className="w-100" controls>
        <source src={src} type={fileType.mime} />
        Your browser does not support the audio element.
      </audio>
    </>
  );
};

export default AudioViewer;
