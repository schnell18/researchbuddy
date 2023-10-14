import React, { useState, useRef, useEffect } from "react";
import { showErrorMessage } from '@jupyterlab/apputils'
import { GridRowParams } from '@mui/x-data-grid';
import { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
// import Stack from '@mui/material/Stack';

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

export const RefineComponent = (): JSX.Element => {
  const [docList, setDocList] = useState<any[]>([]);
  // const [latexOutput, setLatexOutput] = useState<string>('');
  const [plaintextOutput, setPlaintextOutput] = useState<string>('');
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loadBtnEnabled, setSummarizeBtnEnabled] = useState<boolean>(false)
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

  const onSplitDocument = () => {
    setLoading(true);
    const doc = docList.filter(doc => doc.selected)[0];
    const req = {
      libType: libType,
      collection: collection,
      docId: doc.id,
    }
    requestAPI<any>('literature/split', {
      method: 'POST',
      body: JSON.stringify(req)
    }).then(data => {
        setLoading(false);
        if (data.code == 0) {
          //setLatexOutput(data.latex.join(""))
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
    setDocList(
      docList.map((doc, j) => {
        if (params.id === doc.id) {
          doc.selected = !doc.selected
        }
        return doc;
      })
    )
    setSummarizeBtnEnabled(docList.some((d) => d.selected === true));
  };

  return (
    <div>
      <DocListComponent
        docList={docList}
        pageSize={5}
        tableHeight={270}
        actionPerformedBtnEnabled={loadBtnEnabled && !loading}
        onActionPerformed={onSplitDocument}
        actionPerformedButtonText={'Load'}
        onDocChanged={onDocSelChanged}
        libType={libType}
        libTypes={libTypes}
        onLibTypeChanged={onLibTypeChanged}
        collection={collection}
        collections={collections}
        onCollectionChanged={onCollectionChanged}
      />

      <LoadingIndicator loading={loading} />
      <Box sx={{ flexGrow: 1 }}>
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="stretch"
          spacing={2}>
          <Grid xs={5}>
           <RefineInputComponent
             textareaRef={textareaRef}
             lines={plaintextOutput}
             rows={20}
             columns={55}
             placeholder={"Load literature into this pane or paste whatever text you want ..."}
           />
          </Grid>
          <Grid xs={1}>
            <div className="refine-btn-wrapper" >
              <Button variant="contained" disabled={loading} onClick={onRefine}>Refine</Button>
            </div>
          </Grid>
          <Grid xs={5}>
            <RefineOutputComponent revs={revisions} />
          </Grid>
        </Grid>
      </Box>

    </div>
  );
}

// onChange={(event:any) => { setPlaintextOutput(event.target.value) }}
//
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
    return (
        <textarea
          ref={textareaRef}
          rows={rows}
          cols={columns}
          value={lines}
          placeholder={placeholder}/>
    );
}

const RefineOutputComponent = ({revs}: {revs: Revision[]}): JSX.Element => {
    return (
      <table className="revision">
        <tr>
          <th>Original</th>
          <th>Revised</th>
          <th>Reason</th>
      </tr>
        {revs.map((rev, key) => {
          return (
            <tr key={key}>
                <td className="text">{rev.original}</td>
                <td className="text">{rev.revised}</td>
                <td className="text">{rev.reason}</td>
            </tr>
          )
        })}
      </table>
    );
}
