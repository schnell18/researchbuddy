import { ReactWidget } from '@jupyterlab/ui-components';
import React, { useState, useEffect } from "react";
import { Tab } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { requestAPI } from './handler';
import { Hourglass } from 'react-loader-spinner'
import { showErrorMessage } from '@jupyterlab/apputils'
import Select from 'react-select'
// import DropdownTreeSelect from 'react-dropdown-tree-select'
// import 'react-dropdown-tree-select/dist/styles.css'

const MyComponent = (): JSX.Element => {
  const [docList, setDocList] = useState<any[]>([]);
  const [latexOutput, setLatexOutput] = useState<string>('');
  const [plaintextOutput, setPlaintextOutput] = useState<string>('');
  const [summarizeBtnEnabled, setSummarizeBtnEnabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [libType, setLibType] = useState<any>({})
  const [libTypes, setLibTypes] = useState<any[]>([])
  const [collection, setCollection] = useState<any>({})
  const [collections, setCollections] = useState<any[]>([])

  const panes: any[] = [
    { menuItem: 'Plaintext', render: () => <Tab.Pane><TextoutputComponent lines={plaintextOutput} columns={120} rows={25} placeholder={""}/></Tab.Pane> },
    { menuItem: 'LaTeX', render: () => <Tab.Pane><LatexoutputComponent lines={latexOutput}/></Tab.Pane> },
  ]

  function trimFit(text: string) {
    const leng = 85;
    if (text.length > leng) {
      return `${text.substring(0, leng-2)}...`;
    }
    return text;
  }

  useEffect(
    () => {
      requestAPI<any>('libtype')
        .then(data => {
          setLibTypes(data.data)
          let preferred = data.data.filter((d: any) => {d?.preferred === true})
          if (preferred && preferred.length > 0) {
            setLibType(preferred[0])
            loadCollections(preferred[0].value);
          }
          else {
            setLibType(data.data[0])
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
      libType: libType.value,
      docList: docList.filter(doc => doc.selected).map(doc => ({id: doc.id}))
    }
    requestAPI<any>('literature/summary', {
      method: 'POST',
      body: JSON.stringify(req)
    }).then(data => {
        setLoading(false);
        if (data.code == 0) {
          setLatexOutput(data.latex.join(""))
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
          console.log(data.data);
          setCollections(data.data);
          if (data.data.length > 0) {
            setCollection(data.data[0]);
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
            setCollection(data.data[0])
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

  const onLibTypeChanged = (val: any) => {
    console.log(val)
    setLibType(val);
    loadCollections(val.value)
  };

  function loadLiteratures(libType: string, collection: string) {
    requestAPI<any>(`literature?libType=${libType}&collection=${collection}`)
      .then(data => {
        setDocList(data.data.map((val: any) => ({
            ...val, selected: false, title: trimFit(val.title)
        })))
      })
      .catch(reason => {
        console.error(
          `Serverside error failure: ${reason}`
        );
      });
  }

  const onCollectionChanged = (val: any) => {
    setCollection(val);
    loadLiteratures(libType.value, val.value);
  }

  // const onCollectionChanged = (currentNode: any, selectedNodes: any[]) => {
  //   requestAPI<any>(`literature?libType=${libType.value}&collection=${selectedNodes[0].value}`)
  //     .then(data => {
  //       setDocList(data.data.map((val: any) => ({
  //           ...val, selected: false, title: trimFit(val.title)
  //       })))
  //     })
  //     .catch(reason => {
  //       console.error(
  //         `Serverside error failure: ${reason}`
  //       );
  //     });
  // }
  //

  const onChanged = (i: any) => {
    setDocList(
      docList.map((doc, j) => {
        if (i === j) {
          doc.selected = !doc.selected
        }
        return doc;
      })
    )
    setSummarizeBtnEnabled(docList.some((d) => d.selected === true));
  };


  // const data = {
  //   label: 'search me',
  //   value: 'searchme',
  //   children: [
  //     {
  //       label: 'search me too',
  //       value: 'searchmetoo',
  //       children: [
  //         {
  //           label: 'No one can get me',
  //           value: 'anonymous',
  //         },
  //       ],
  //     },
  //   ],
  // }
  //
  //

  return (
    <div className="App">
      <DocListComponent
        docList={docList}
        summarizeBtnEnabled={summarizeBtnEnabled && !loading}
        onSummarize={onSummarize}
        onDocChanged={onChanged}
        libTypes={libTypes}
        libType={libType}
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
    libTypes,
    libType,
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
    libTypes: any[],
    libType: any,
    onLibTypeChanged: any,
    collection: any,
    collections: any[],
    onCollectionChanged: any,
  }
): JSX.Element => {

  return (
    <div>
      <div>
        <div className="float-child">
          <label>Collection:</label>
        <Select
          options={collections}
          value={collection}
          onChange={onCollectionChanged}
        />
        </div>
        <div className="float-child">
        <span>
          <label>Corpus:</label>
          <Select
            options={libTypes}
            value={libType}
            onChange={onLibTypeChanged}
          />
        </span>
        </div>
      </div>
      <table className="doclist">
        <tr>
          <th></th>
          <th>Title</th>
          <th>Author</th>
          <th>Year</th>
          <th>Pages</th>
      </tr>
        {docList.map((val, key) => {
          return (
            <tr key={key}>
                <td><input
                    type="checkbox"
                    checked={val.selected}
                    onChange={() => onDocChanged(key)}/>
                </td>
                <td className="text">{val.title}</td>
                <td className="text">{val.author}</td>
                <td className="numeric">{val.year}</td>
                <td className="numeric">{val.pages}</td>
            </tr>
          )
        })}
      </table>
      <button className="bottom-button" disabled={!summarizeBtnEnabled} onClick={onSummarize} >
        Make Summarization
      </button>
    </div>
  );
}

const LatexoutputComponent = ({lines}: {lines: string}): JSX.Element => {
    return (
      <div>
        <TextoutputComponent lines={lines} rows={25} columns={120} placeholder={""}/>
        <button className="bottom-button">Open in Overleaf</button>
      </div>
    );
}

const TextoutputComponent = ({lines, rows=25, columns=120, placeholder="empty..."}: {lines: string, rows: number, columns: number, placeholder: string}): JSX.Element => {
    return (
      <div>
        <textarea rows={rows} cols={columns} value={lines} placeholder={placeholder}/>
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

