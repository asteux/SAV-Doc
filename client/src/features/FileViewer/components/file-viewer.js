import React, { useEffect, useState } from "react";
import { getFileType } from '../../../utils/file';
import { AudioViewer, ImageViewer, PdfViewer, TextViewer, UnsupportedViewer, VideoViewer } from "./viewers";

const renderViewer = (fileType, props) => {
  let viewer = <UnsupportedViewer {...props}/>;
  if (fileType) {
    const height = 512;
    switch (fileType.mime) {
      // CSV
      // Suite Microsoft Word (writer, feuille de calcul, diapo)
      // Suite LibreOffice (writer, feuille de calcul, diapo)
      // Fichier texte, json, xml, ...
      case 'application/pdf':
        viewer = <PdfViewer {...props} height={height} />;
        break;

      case 'audio/mpeg':
      case 'audio/ogg':
      case 'audio/wav':
        viewer = <AudioViewer {...props} />;
        break;

      case 'image/apng':
      case 'image/avif':
      case 'image/bmp':
      case 'image/gif':
      case 'image/jpeg':
      case 'image/png':
      case 'image/svg+xml':
      case 'image/webp':
      case 'image/x-icon':
        viewer = <ImageViewer {...props} height={height} />;
        break;

      case 'application/json':
      case 'application/x-shellscript':
      case 'text/markdown':
      case 'text/plain':
        viewer = <TextViewer {...props} height={height} />;
        break;

      case 'video/mp4':
      case 'video/webm':
      case 'video/ogg':
        viewer = <VideoViewer {...props} height={height}/>;
        break;

      default:
        if (fileType.mime.startsWith('text/')) {
          viewer = <TextViewer {...props} height={height} />;
        }

        break;
    }
  }

  return viewer;
};

const FileViewer = ({ file }) => {
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    (async () => {
      const fileType = await getFileType(file);
      console.log(fileType ?? file.type);

      setFileType(fileType ?? { ext: undefined, mime: file.type });
    })();
  }, [file]);

  return (
    <>
      <div className="file-viewer">
        {renderViewer(fileType, { file, fileType })}
      </div>
    </>
  );
};

export default FileViewer;
