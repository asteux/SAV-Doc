import React, { useCallback,  useMemo, useState } from "react";
import { Button, makeStyles, Typography } from '@material-ui/core';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Document, Page } from 'react-pdf';
import Measure from 'react-measure';
import { throttle } from "lodash";

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    // maxHeight: '512px',
  },
  wrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    overflow: 'auto',
  },
  pageControls: {
    position: 'absolute',
    bottom: '5%',
    left: '50%',
    display: 'flex',
    justiyContent: 'center',
    aligIitems: 'center',
    background: theme.palette.background.paper,
    // opacity: 0,
    transform: 'translateX(-50%)',
    transition: 'opacity ease-in-out 0.2s',
    boxShadow: '0 30px 40px 0 rgb(16 36 94 / 20%)',
    borderRadius: '4px',
  },
}));

const PdfViewer = ({ file, fileType, height }) => {
  const classes = useStyles();

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const [wrapperWidth, setWrapperWidth] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);

  const fitHorizontal = useMemo(() => {
    const wRatio = pageWidth / wrapperWidth;
    const hRatio = pageHeight / wrapperHeight;
    if (wRatio < hRatio) {
      return false;
    }
    return true;
  }, [pageHeight, pageWidth, wrapperHeight, wrapperWidth]);

  const setWrapperDimensions = useCallback(throttle((w, h) => {
    setWrapperWidth(w);
    setWrapperHeight(h);
  }, 500), []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  const previousPage = () => {
    changePage(-1);
  }

  const nextPage = () => {
    changePage(1);
  }

  return (
    <div className={classes.container} style={{ height: `${height}px`}}>
      <Measure
        bounds
        onResize={(contentRect) => setWrapperDimensions(contentRect.bounds.width, contentRect.bounds.height)}
      >
        {({ measureRef }) => (
          <div className={classes.wrapper} ref={measureRef}>
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error}>
              <Page pageNumber={pageNumber}
                onLoadSuccess={(page) => {
                  setPageWidth(page.width);
                  setPageHeight(page.height);
                }}
                width={fitHorizontal ? wrapperWidth : null}
                height={!fitHorizontal ? wrapperHeight : null} />
            </Document>

            <div className={classes.pageControls}>
              <Button disabled={pageNumber <= 1} onClick={previousPage}><NavigateBeforeIcon /></Button>
              <Typography className="mx-2 my-auto">Page {pageNumber || (numPages ? 1 : '--')} sur {numPages || '--'}</Typography>
              <Button disabled={pageNumber >= numPages} onClick={nextPage}><NavigateNextIcon /></Button>
            </div>
          </div>
          )}
      </Measure>
    </div>
  );
};

export default PdfViewer;
