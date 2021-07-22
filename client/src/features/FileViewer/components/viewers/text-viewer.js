import { makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import Highlight from 'react-highlight.js';

import { readFileAsText } from "../../../../utils/file";

const useStyles = makeStyles((theme) => ({
  highlight: {
    overflow: 'auto',
  },
}));

const mappingMimeToLanguage = {
  'application/json': 'json',
  'application/x-shellscript': 'bash',
  'text/markdown': 'markdown',
  'text/plain': 'plaintext',
};

const TextViewer = ({ file, fileType, height }) => {
  const classes = useStyles();

  const [content, setContent] = useState(null);

  useEffect(() => {
    (async () => {
      setContent(await readFileAsText(file));
    })();
  }, [file]);

  return (
    <>
      <Highlight language={mappingMimeToLanguage[fileType.mime] ?? 'plaintext'} className={classes.highlight} style={{ maxHeight: height ? `${height}px` : null }}>
        {content}
      </Highlight>
    </>
  );
};

export default TextViewer;
