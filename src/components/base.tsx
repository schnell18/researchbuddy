import React from "react";
import { Tab } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { Hourglass } from 'react-loader-spinner'
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { DataGrid, GridColDef, GridRowSelectionModel, GridCallbackDetails } from '@mui/x-data-grid';
import Radio from "@mui/material/Radio";
import Backdrop from '@mui/material/Backdrop';

export const LoadingIndicator = ({ loading }: { loading: boolean }): JSX.Element => {
  if (loading) {
    return (
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <Hourglass
            visible={loading}
            height="80"
            width="80"
            ariaLabel="hourglass-loading"
            colors={['#306cce', '#72a1ed']}
          />
        </Backdrop>
    )
  }
  return (
    <div></div>
  )
}

export const DocListComponent = (
  {
    id,
    radioSelection,
    docList,
    pageSize,
    tableHeight,
    onDocChanged,
    libType,
    libTypes,
    onLibTypeChanged,
    collection,
    collections,
    onCollectionChanged
  }:
  {
    id: string,
    radioSelection: boolean,
    docList: any[],
    pageSize: number,
    tableHeight: number,
    onDocChanged: any,
    libType: any,
    libTypes: any[],
    onLibTypeChanged: any,
    collection: any,
    collections: any[],
    onCollectionChanged: any,
  }
): JSX.Element => {

  const [selectionModel, setSelectionModel] = React.useState<any[]>([]);
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

  if (radioSelection) {
    columns.unshift({
      field: "radiobutton",
      headerName: "",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Radio checked={selectionModel.length > 0 && selectionModel[0] === params.id} value={params.id} />
      )
    });
  }
  return (
    <div id={id}>
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
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={
            (newSelectionModel: GridRowSelectionModel, details: GridCallbackDetails) => {
            setSelectionModel(newSelectionModel);
          }}
          onCellClick={onDocChanged}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: pageSize },
            },
          }}
          sx={{fontSize: 14}}
          pageSizeOptions={[pageSize, pageSize * 2]}
          checkboxSelection={!radioSelection}
        />
      </div>
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

