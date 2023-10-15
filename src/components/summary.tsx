import React, { useState, useEffect } from "react";
import { Tab } from 'semantic-ui-react'
import { showErrorMessage } from '@jupyterlab/apputils'
import { SelectChangeEvent } from '@mui/material/Select';
import { GridRowParams } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import {
  OutputComponent,
  TextoutputComponent,
  DocListComponent,
  LoadingIndicator
} from './base';

import { requestAPI } from '../handler';

export const SummaryComponent = (): JSX.Element => {
  const [docList, setDocList] = useState<any[]>([]);
  // const [latexOutput, setLatexOutput] = useState<string>('');
  const [plaintextOutput, setPlaintextOutput] = useState<string>('');
  const [summarizeBtnEnabled, setSummarizeBtnEnabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [libType, setLibType] = useState<string>('')
  const [libTypes, setLibTypes] = useState<any[]>([])
  const [collection, setCollection] = useState<string>('')
  const [collections, setCollections] = useState<any[]>([])

  const panes: any[] = [
    { menuItem: 'Result', render: () => <Tab.Pane><TextoutputComponent lines={plaintextOutput} columns={120} rows={15} placeholder={""}/></Tab.Pane> },
    //{ menuItem: 'LaTeX', render: () => <Tab.Pane><LatexoutputComponent lines={latexOutput}/></Tab.Pane> },
  ]

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

  const onSummarize = () => {
    setLoading(true);
    const req = {
      libType: libType,
      collection: collection,
      docList: docList.filter(doc => doc.selected).map(doc => ({id: doc.id}))
    }
    requestAPI<any>('literature/summary', {
      method: 'POST',
      body: JSON.stringify(req)
    }).then(data => {
        setLoading(false);
        if (data.code == 0) {
          //setLatexOutput(data.latex.join(""))
          setPlaintextOutput(data.plaintext.join(""))
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
        id={'summary-doclist-wrapper'}
        radioSelection={false}
        docList={docList}
        pageSize={6}
        tableHeight={300}
        onDocChanged={onDocSelChanged}
        libType={libType}
        libTypes={libTypes}
        onLibTypeChanged={onLibTypeChanged}
        collection={collection}
        collections={collections}
        onCollectionChanged={onCollectionChanged}
      />
      <ButtonPanelComponent 
        actionPerformedBtnEnabled={summarizeBtnEnabled && !loading}
        actionPerformedButtonText={'Summarize'}
        onActionPerformed={onSummarize}
      />
      <LoadingIndicator loading={loading} />
      <OutputComponent panes={panes}/>
    </div>
  );
}

const ButtonPanelComponent = (
  {
    actionPerformedBtnEnabled,
    onActionPerformed,
    actionPerformedButtonText,
  }:
  {
    actionPerformedBtnEnabled: boolean,
    onActionPerformed: any,
    actionPerformedButtonText: string,
  }
): JSX.Element => {

  return (
    <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="flex-end"
        spacing={2}
      >
      <Button
          variant="contained"
          disabled={!actionPerformedBtnEnabled}
          onClick={onActionPerformed}
      >
          {actionPerformedButtonText}
      </Button>
    </Stack>
  );
}
