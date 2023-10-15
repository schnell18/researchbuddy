import React, { useState, useRef, useEffect } from "react";
import { showErrorMessage } from '@jupyterlab/apputils'
import { GridRowParams } from '@mui/x-data-grid';
import { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
// import Grid from '@mui/material/Unstable_Grid2';
// import Box from '@mui/material/Box';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';

import { requestAPI } from '../handler';
import {
  DocListComponent,
  LoadingIndicator
} from './base';


interface Revision {
  original: string,
  revised: string,
  reason?: string
}

interface ElementWidth {
  id: string,
  width: string,
}

export const RefineComponent = (): JSX.Element => {
  const placeholders = [
    {original: "", revised: "", reason: ""} as Revision,
    {original: "", revised: "", reason: ""} as Revision,
    {original: "", revised: "", reason: ""} as Revision,
    {original: "", revised: "", reason: ""} as Revision,
    {original: "", revised: "", reason: ""} as Revision,
    {original: "", revised: "", reason: ""} as Revision,
    {original: "", revised: "", reason: ""} as Revision,
    {original: "", revised: "", reason: ""} as Revision,
    {original: "", revised: "", reason: ""} as Revision,
    {original: "", revised: "", reason: ""} as Revision,
  ]
  const [docList, setDocList] = useState<any[]>([]);
  const [plaintextOutput, setPlaintextOutput] = useState<string>('');
  const [revisions, setRevisions] = useState<Revision[]>(placeholders);
  const [loading, setLoading] = useState<boolean>(false)
  const [libType, setLibType] = useState<string>('')
  const [libTypes, setLibTypes] = useState<any[]>([])
  const [collection, setCollection] = useState<string>('')
  const [collections, setCollections] = useState<any[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(
    () => {
      requestAPI<any>('libtype')
        .then(data => {
          setLibTypes(data.data)
          let preferred = data.data.filter((d: any) => {d?.preferred === true})
          if (preferred && preferred.length > 0) {
            setLibType(preferred[0].value)
            loadCollections(preferred[0].value);
          }
          else {
            setLibType(data.data[0].value)
            loadCollections(data.data[0].value);
          }
        })
        .catch(reason => {
          console.error(
            `Serverside error failure: ${reason}`
          );
        });
    },
    []
  );

  const onRefine = () => {
    if (!textareaRef.current) return;
    if (textareaRef.current.selectionStart === textareaRef.current.selectionEnd) {
      showErrorMessage("Error", "No text is selected, please select text to refine!")
      return;
    }

    setLoading(true);
    const text = plaintextOutput.substring(
      textareaRef.current.selectionStart,
      textareaRef.current.selectionEnd,
    );
    console.log("selected text: " + text);
    const req = {
      libType: libType,
      collection: collection,
      text: text,
    }
    requestAPI<any>('literature/refine', {
      method: 'POST',
      body: JSON.stringify(req)
    }).then(data => {
        setLoading(false);
        if (data.code == 0) {
          setRevisions(data.revisions)
        }
        else {
          showErrorMessage("Failure", data.errMsg)
        }
      })
      .catch(reason => {
        console.error(
          `Serverside error failure: ${reason}`
        );
        setLoading(false);
        showErrorMessage("Failure", reason)
      });
  }

  function loadCollections(libType: string) {
    if (libType === 'zotero') {
      requestAPI<any>('libtype/zotero')
        .then(data => {
          setCollections(data.data);
          if (data.data.length > 0) {
            setCollection(data.data[0].value);
            loadLiteratures(libType, data.data[0].value);
          }
        })
        .catch(reason => {
          console.error(
            `Serverside error failure: ${reason}`
          );
        });
    }
    else if (libType === 'folder') {
      requestAPI<any>('libtype/folder')
        .then(data => {
          setCollections(data.data)
          if (data.data.length > 0) {
            setCollection(data.data[0].value)
            loadLiteratures(libType, data.data[0].value);
          }
        })
        .catch(reason => {
          console.error(
            `Serverside error failure: ${reason}`
          );
        });
    }
  }

  const onLibTypeChanged = (event: SelectChangeEvent) => {
    setLibType(event.target.value);
    loadCollections(event.target.value)
  };


  const onCollectionChanged = (event: SelectChangeEvent) => {
    setCollection(event.target.value);
    loadLiteratures(libType, event.target.value);
  }

  function loadLiteratures(libType: string, collection: string) {
    requestAPI<any>(`literature?libType=${libType}&collection=${collection}`)
      .then(data => {
        setDocList(data.data.map((val: any) => ({
            ...val, selected: false, title: val.title
        })))
      })
      .catch(reason => {
        console.error(
          `Serverside error failure: ${reason}`
        );
      });
  }

  const onDocSelChanged = (params: GridRowParams, event: any, details: any) => {

    const doc = docList.filter(doc => !doc.selected && params.id === doc.id)[0];
    setDocList(
      docList.map((doc, j) => {
        if (params.id === doc.id) {
          doc.selected = !doc.selected
        }
        return doc;
      })
    )
    if (!doc) {
      // no document selected
      return;
    }

    const req = {
      libType: libType,
      collection: collection,
      docId: doc.id,
    }
    setLoading(true);
    requestAPI<any>('literature/split', {
      method: 'POST',
      body: JSON.stringify(req)
    }).then(data => {
        setLoading(false);
        if (data.code == 0) {
          setPlaintextOutput(data.text)
        }
        else {
          showErrorMessage("Failure", data.errMsg)
        }
      })
      .catch(reason => {
        console.error(
          `Serverside error failure: ${reason}`
        );
        setLoading(false);
        showErrorMessage("Failure", reason)
      });
  };

  return (
    <div>
      <DocListComponent
        id={'refine-doclist-wrapper'}
        radioSelection={true}
        docList={docList}
        pageSize={5}
        tableHeight={270}
        onDocChanged={onDocSelChanged}
        libType={libType}
        libTypes={libTypes}
        onLibTypeChanged={onLibTypeChanged}
        collection={collection}
        collections={collections}
        onCollectionChanged={onCollectionChanged}
      />

      <LoadingIndicator loading={loading} />
      <div className="refinePanelContainer">
        <div style={{width: '36%'}} id="refine-input-wrapper">
           <RefineInputComponent
             textareaRef={textareaRef}
             lines={plaintextOutput}
             rows={20}
             columns={70}
             placeholder={"Load literature into this pane or paste whatever text you want ..."}
           />
        </div>
        <div style={{width: '8%'}} id="refine-btn-wrapper" >
          <Button variant="contained" disabled={loading} onClick={onRefine}>Refine</Button>
        </div>
        <div style={{width: '56%'}} id="refine-output-wrapper" >
          <RefineOutputComponent revs={revisions} />
        </div>
      </div>
    </div>
  );
}


const RefineInputComponent = (
  {
    textareaRef, lines, rows=20, columns=80, placeholder="empty..."
  }:
  {
    textareaRef: any,
    lines: string,
    rows: number,
    columns: number,
    placeholder: string
  }): JSX.Element => {

        //<textarea
    return (
        <TextareaAutosize
          id="splitTextarea"
          ref={textareaRef}
          minRows={rows}
          maxRows={rows}
          cols={columns}
          value={lines}
          placeholder={placeholder}/>
    );
}

const RefineOutputComponent = ({revs}: {revs: Revision[]}): JSX.Element => {
  
  function toggle(maxElem: ElementWidth, elements: ElementWidth[]) {
    let hide = true;
    for (let index = 0; index < elements.length; index++) {
      const id = elements[index].id;
      const width = elements[index].width;
      let elem = document.getElementById(id);
      if (elem) {
        if (elem.style.display !== 'none') {
          elem.style.display = 'none';
          elem.style.width = '0';
        }
        else {
          elem.style.display = '';
          if (width) {
            elem.style.width = width;
          }
          hide = false;
        }
      }
    }
    let m = document.getElementById(maxElem.id);
    if (m && hide) {
      m.style.width = '100%';
    }
    else if (m) {
      m.style.width = maxElem.width;
    }
  }

  function onClick(event: React.MouseEvent<HTMLElement>) {
    if (event.detail === 2) {
      let elems = [
        {id: 'refine-input-wrapper', width: '36%'} as ElementWidth,
        {id: 'refine-btn-wrapper', width: '8%'} as ElementWidth,
        {id: 'refine-doclist-wrapper', width: '100%'} as ElementWidth,
      ];
      let maxElem = {id: 'refine-output-wrapper', width: '56%'} as ElementWidth;
      toggle(maxElem, elems);
    }
  }

  return (
    <TableContainer component={Paper} onClick={onClick}>
      <Table sx={{ minWidth: 500 }} aria-label="AI revision table">
        <TableHead>
          <TableRow>
            <TableCell>Original</TableCell>
            <TableCell>Revised</TableCell>
            <TableCell>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {revs.map((row) => (
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.original}
              </TableCell>
              <TableCell>{row.revised}</TableCell>
              <TableCell>{row.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
