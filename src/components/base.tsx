import React from "react";
import { Tab } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { Hourglass } from 'react-loader-spinner'
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export const LoadingIndicator = ({ loading }: { loading: boolean }): JSX.Element => {
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

export const DocListComponent = (
  {
    docList,
    pageSize,
    tableHeight,
    actionPerformedBtnEnabled,
    onActionPerformed,
    actionPerformedButtonText,
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
    pageSize: number,
    tableHeight: number,
    actionPerformedBtnEnabled: boolean,
    onActionPerformed: any,
    actionPerformedButtonText: string,
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
    { field: 'year', headerName: 'Year', flex: 10 },
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

      <div style={{ height: tableHeight, width: '100%' }}>
        <DataGrid
          rows={docList}
          columns={columns}
          density={'compact'}
          onCellClick={onDocChanged}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: pageSize },
            },
          }}
          sx={{fontSize: 14}}
          pageSizeOptions={[pageSize, pageSize * 2]}
          checkboxSelection
        />
      </div>

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
        
    </div>
  );
}

export const TextoutputComponent = (
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

export const OutputComponent = ({panes}: {panes: any[]}): JSX.Element => {
    return (
     <Tab panes={panes} />
    );
}

