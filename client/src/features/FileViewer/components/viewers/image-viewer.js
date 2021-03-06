import React, { useEffect, useState } from "react";
import { Image } from "react-bootstrap";

const ImageViewer = ({ file, fileType, height }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    (async () => {
      setSrc(URL.createObjectURL(file));
    })();
  }, [file]);

  return (
    <>
      <div className="text-center" style={{ maxHeight: (height) ? `${height}px` : null }}>
        <Image src={src} style={{ maxWidth: '100%',  maxHeight: (height) ? `${height}px` : null }} />
      </div>
    </>
  );
};

export default ImageViewer;
