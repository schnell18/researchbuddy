import React from 'react'
import { ReactWidget } from '@jupyterlab/ui-components';
// import React, { useState, useEffect } from "react";
import { Tab } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import { SummaryComponent } from './components/summary'
import { RefineComponent } from './components/refine'

const MyComponent = (): JSX.Element => {
  const panes: any[] = [
    { menuItem: 'Summarize', render: () => <Tab.Pane><SummaryComponent/></Tab.Pane> },
    { menuItem: 'Refine', render: () => <Tab.Pane><RefineComponent/></Tab.Pane> },
  ]

      // <Tab menu={{ fluid: true, vertical: true, tabular: true }} grid={{paneWidth: 9, tabWidth: 1}} panes={panes} />
  return (
    <div className="App">
      <Tab panes={panes} />
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

