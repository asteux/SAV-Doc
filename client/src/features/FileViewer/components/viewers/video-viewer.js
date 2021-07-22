import React, { useEffect, useState } from "react";

const VideoViewer = ({ file, fileType, height }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    (async () => {
      setSrc(URL.createObjectURL(file));
    })();
  }, [file]);

  return (
    <>
      <div>
        <video controls height={height} style={{ display: 'block', margin: '0 auto' }}>
          <source src={src} type={fileType.mime} />
          Your browser does not support the video tag.
        </video>
      </div>
    </>
  );
};

export default VideoViewer;
