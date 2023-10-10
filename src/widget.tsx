import { ReactWidget } from '@jupyterlab/ui-components';
import React, { useState, useEffect } from "react";
import { Tab } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { requestAPI } from './handler';


const DocListComponent = (): JSX.Element => {
  const [docList, setDocList] = useState<any[]>([]);

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
    const req = docList.filter(doc => doc.selected);
    requestAPI<any>('literature/summary', {
      method: 'POST',
      body: JSON.stringify(req)
    }).then(data => {
        const latex = document.getElementById("latexoutput")
        if (latex) {
          latex.innerHTML = data.latex.join("")
        }
        const plaintext = document.getElementById("plaintextoutput")
        if (plaintext) {
          plaintext.innerHTML = data.plaintext.join("")
        }
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_research_buddy server extension appears to be missing.\n${reason}`
        );
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
  };

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
      <button className="bottom-button" onClick={onSummarize} >
        Make Summarization
      </button>
    </div>
  );
}

const LatexoutputComponent = (): JSX.Element => {
    return (
      <div>
        <textarea
          id="latexoutput"
          rows={25}
          cols={120}
          placeholder="LaTeX output here"
        />
        <button className="bottom-button">Open in Overleaf</button>
      </div>
    );
}

const TextoutputComponent = (): JSX.Element => {
    return (
      <div>
        <textarea
          id="plaintextoutput"
          rows={25}
          cols={120}
          placeholder="Plaintext output here"
        />
      </div>
    );
}

const panes = [
  { menuItem: 'Plaintext', render: () => <Tab.Pane><TextoutputComponent/></Tab.Pane> },
  { menuItem: 'LaTeX', render: () => <Tab.Pane><LatexoutputComponent/></Tab.Pane> },
]

const OutputComponent = (): JSX.Element => {
    return (
     <Tab panes={panes} />
    );
}

const MyComponent = (): JSX.Element => {
    return (
    <div className="App">
      <DocListComponent/>
      <OutputComponent/>
    </div>
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

