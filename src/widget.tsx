import { ReactWidget } from '@jupyterlab/ui-components';
import React, { useState, useEffect } from "react";
import { Tab } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { requestAPI } from './handler';
import { Hourglass } from 'react-loader-spinner'

const MyComponent = (): JSX.Element => {
  const [docList, setDocList] = useState<any[]>([]);
  const [latexOutput, setLatexOutput] = useState<string>('');
  const [plaintextOutput, setPlaintextOutput] = useState<string>('');
  const [summarizeBtnEnabled, setSummarizeBtnEnabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const panes: any[] = [
    { menuItem: 'Plaintext', render: () => <Tab.Pane><TextoutputComponent lines={plaintextOutput} columns={120} rows={25} placeholder={""}/></Tab.Pane> },
    { menuItem: 'LaTeX', render: () => <Tab.Pane><LatexoutputComponent lines={latexOutput}/></Tab.Pane> },
  ]

  useEffect(
    () => {
      requestAPI<any>('literature')
        .then(data => {
          setDocList(data.data.map((val: any) => {val.selected=false; return val; }))
        })
        .catch(reason => {
          console.error(
            `The jupyterlab_research_buddy server extension appears to be missing.\n${reason}`
          );
        });
    },
    []
  );

  const onSummarize = () => {
    // TODO: make call to backend and display WIP status until server
    // responds
    setLoading(true);
    const req = docList.filter(doc => doc.selected);
    requestAPI<any>('literature/summary', {
      method: 'POST',
      body: JSON.stringify(req)
    }).then(data => {
        setLatexOutput(data.latex.join(""))
        setPlaintextOutput(data.plaintext.join(""))
        setLoading(false);
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_research_buddy server extension appears to be missing.\n${reason}`
        );
        setLoading(false);
      });
  };

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

  return (
    <div className="App">
      <DocListComponent docList={docList} summarizeBtnEnabled={summarizeBtnEnabled && !loading}  onSummarize={onSummarize} onChanged={onChanged}/>
      <Hourglass
        visible={loading}
        height="80"
        width="80"
        ariaLabel="hourglass-loading"
        colors={['#306cce', '#72a1ed']}
      />
      <OutputComponent panes={panes}/>
    </div>
  );

  // return (
  //   <div className="App">
  //     <DocListComponent docList={docList} summarizeBtnEnabled={summarizeBtnEnabled && !loading}  onSummarize={onSummarize} onChanged={onChanged}/>
  //     <OutputComponent panes={panes}/>
  //   </div>
  //   <div className="Loader">
  //      <Dimmer active={true} inverted={true} size="massive">
  //         <Loader inverted={true}>Working...</Loader>
  //      </Dimmer>
  //   </div>
  // );

}

const DocListComponent = ({docList, summarizeBtnEnabled, onSummarize, onChanged}: {docList: any[], summarizeBtnEnabled: boolean, onSummarize: any, onChanged: any}): JSX.Element => {

  return (
    <div>
      <h3>Select the literature to summarize</h3>
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
                    onChange={() => onChanged(key)}/>
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

