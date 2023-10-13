import { ReactWidget } from '@jupyterlab/ui-components';
import React, { useState, useEffect } from "react";
import { Tab } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { Hourglass } from 'react-loader-spinner'
import { showErrorMessage } from '@jupyterlab/apputils'
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

import { requestAPI } from './handler';

const MyComponent = (): JSX.Element => {
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
    { menuItem: 'Result', render: () => <Tab.Pane><TextoutputComponent lines={plaintextOutput} columns={120} rows={20} placeholder={""}/></Tab.Pane> },
    //{ menuItem: 'LaTeX', render: () => <Tab.Pane><LatexoutputComponent lines={latexOutput}/></Tab.Pane> },
  ]

  // function trimFit(text: string) {
  //   const leng = 85;
  //   if (text.length > leng) {
  //     return `${text.substring(0, leng-2)}...`;
  //   }
  //   return text;
  // }

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
    <div className="App">
      <DocListComponent
        docList={docList}
        summarizeBtnEnabled={summarizeBtnEnabled && !loading}
        onSummarize={onSummarize}
        onDocChanged={onDocSelChanged}
        libType={libType}
        libTypes={libTypes}
        onLibTypeChanged={onLibTypeChanged}
        collection={collection}
        collections={collections}
        onCollectionChanged={onCollectionChanged}
      />
      <LoadingIndicator loading={loading} />
      <OutputComponent panes={panes}/>
    </div>
  );

}

const LoadingIndicator = ({ loading }: { loading: boolean }): JSX.Element => {
  if (loading) {
    return (
      <div className="center">
        <Hourglass
          visible={loading}
          height="80"
          width="80"
          ariaLabel="hourglass-loading"
          colors={['#306cce', '#72a1ed']}
        />
      </div>
    )
  }
  return (
    <div></div>
  )
}

const DocListComponent = (
  {
    docList,
    summarizeBtnEnabled,
    onSummarize,
    onDocChanged,
    libType,
    libTypes,
    onLibTypeChanged,
    collection,
    collections,
    onCollectionChanged
  }:
  {
    docList: any[],
    summarizeBtnEnabled: boolean,
    onSummarize: any,
    onDocChanged: any,
    libType: any,
    libTypes: any[],
    onLibTypeChanged: any,
    collection: any,
    collections: any[],
    onCollectionChanged: any,
  }
): JSX.Element => {

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      description: 'Title of the literature',
      flex: 60,
    },
    { field: 'author', headerName: 'Author', flex: 20 },
    { field: 'year', headerName: 'Year', type: 'number', flex: 10 },
    { field: 'pages', headerName: 'Pages', type: 'number', flex: 10 },
  ];

  return (
    <div>
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="flex-end"
        spacing={2}
      >

        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel id="corpus-select-label">Corpus</InputLabel>
          <Select
            id="corpus-select"
            labelId="corpus-select-label"
            value={libType}
            label="Corpus"
            onChange={onLibTypeChanged}
          >
          {libTypes.map((val, key) => {
            return (
              <MenuItem value={val.value}>{val.label}</MenuItem>
            )
          })}
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel id="collection-select-label">Collection</InputLabel>
          <Select
            id="collection-select"
            labelId="collection-select-label"
            value={collection}
            label="Collection"
            onChange={onCollectionChanged}
          >
          {collections.map((val, key) => {
            return (
              <MenuItem value={val.value}>{val.label}</MenuItem>
            )
          })}
          </Select>
        </FormControl>

      </Stack>

      <div style={{ height: 300, width: '100%' }}>
        <DataGrid
          rows={docList}
          columns={columns}
          density={'compact'}
          onCellClick={onDocChanged}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 6 },
            },
          }}
          sx={{fontSize: 14}}
          pageSizeOptions={[6, 12]}
          checkboxSelection
        />
      </div>

      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="flex-end"
        spacing={2}
      >
      <Button variant="contained" disabled={!summarizeBtnEnabled} onClick={onSummarize}>Summarize</Button>
      </Stack>
        
    </div>
  );

}

// const LatexoutputComponent = ({lines}: {lines: string}): JSX.Element => {
//     return (
//       <div>
//         <TextoutputComponent lines={lines} rows={20} columns={120} placeholder={""}/>
//         <button className="bottom-button">Open in Overleaf</button>
//       </div>
//     );
// }

const TextoutputComponent = (
  {
    lines, rows=25, columns=120, placeholder="empty..."
  }:
  {
    lines: string,
    rows: number,
    columns: number,
    placeholder: string
  }): JSX.Element => {
    return (
      <div>
        <textarea
          rows={rows}
          cols={columns}
          value={lines}
          placeholder={placeholder}/>
      </div>
    );
}

const OutputComponent = ({panes}: {panes: any[]}): JSX.Element => {
    return (
     <Tab panes={panes} />
    );
}

/**
 * A Counter Lumino Widget that wraps a CounterComponent.
 */
export class CounterWidget extends ReactWidget {
  /**
   * Constructs a new CounterWidget.
   */
  constructor() {
    super();
    this.addClass('jp-react-widget');
  }

  render(): JSX.Element {
    return <MyComponent/>;
  }
}

