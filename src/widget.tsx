import { ReactWidget } from '@jupyterlab/ui-components';
import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

//import React, { useState } from 'react';

// const CounterComponent = (): JSX.Element => {
//   const  = useState(0);
//   return (
//     <div>
//       <p>You clicked {counter} times!</p>
//       <button
//         onClick={(): void => {
//           setCounter(counter + 1);
//         }}
//       >
//         Increment
//       </button>
//     </div>
//   );
// };


const rows = [
    { title: "Lost in the Middle: How Language Models Use Long Contexts", pages: 10, author: "Liu et al." },
    { title: "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers", pages: 8, author: "Frantar et al." },
    { title: "HuggingFace's Transformers: State-of-the-art Natural Language Processing", pages: 9, author: "Wolf et al." },
    { title: "HuggingFace's Transformers: State-of-the-art Natural Language Processing", pages: 9, author: "Wolf et al." },
    { title: "HuggingFace's Transformers: State-of-the-art Natural Language Processing", pages: 9, author: "Wolf et al." },
    { title: "HuggingFace's Transformers: State-of-the-art Natural Language Processing", pages: 9, author: "Wolf et al." },
    { title: "HuggingFace's Transformers: State-of-the-art Natural Language Processing", pages: 9, author: "Wolf et al." },
    { title: "HuggingFace's Transformers: State-of-the-art Natural Language Processing", pages: 9, author: "Wolf et al." },
]
 
const DocListComponent = (): JSX.Element => {
    return (
      <div className="App">
        <table>
            <tr>
                <th></th>
                <th>Title</th>
                <th>Author</th>
                <th>Pages</th>
            </tr>
            {rows.map((val, key) => {
                return (
                    <tr key={key}>
                        <td><input type="checkbox"/></td>
                        <td>{val.title}</td>
                        <td>{val.author}</td>
                        <td>{val.pages}</td>
                    </tr>
                )
            })}
        </table>
        <button>Make Summarization</button>
      </div>


    );
}

const LatexoutputComponent = (): JSX.Element => {
    return (
      <div>
        <textarea
          rows={10}
          cols={72}
          value={"LaTeX output here"}
        />
        <button>Open in Overleaf</button>
      </div>
    );
}

const TextoutputComponent = (): JSX.Element => {
    return (
      <div>
        <textarea
          rows={10}
          cols={72}
          value={"Plain text output here"}
        />
      </div>
    );
}

const OutputComponent = (): JSX.Element => {
    return (
      <Tabs>
        <TabList>
          <Tab>plaintext</Tab>
          <Tab>latex</Tab>
        </TabList>
        <TabPanel>
          <TextoutputComponent/>
        </TabPanel>
        <TabPanel>
          <LatexoutputComponent/>
        </TabPanel>
      </Tabs>
    );
}

const MyComponent = (): JSX.Element => {
    return (
    <div>
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

