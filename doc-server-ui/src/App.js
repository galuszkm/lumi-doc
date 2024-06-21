import React, { useState, useEffect } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primeicons/primeicons.css';
import "./App.css";

const App = ({ requestURL }) => {
  // States
  const [sessions, setSessions] = useState(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  // On component mount
  useEffect(() => {
    fetchSessions();
    setLoading(false);
  }, []);

  const fetchSessions =  async () => {
    const url = `${requestURL}/getAllSessions`;
    const data = await fetch(url, { method: 'GET' }).then(response => response.json());
    if (data) {
      const __sessions__ = data.map(i => ({
        id: i.id,
        date: i.createTime,
        user: i.owner,
      }));
      setSessions(__sessions__);
    } else {
      // Set empty array to sessions
      setSessions([]);
    }
  }

  const createNewSession = async () => {
    const url = `${requestURL}/createNewSession`;
    const response = await fetch(url, { method: 'GET' }).then(response => response.json());
    console.log(response)
    fetchSessions();
  }

  const editSessionDoc = (sessionID) => {
    window.open(`${requestURL}/editor?sessionID=${sessionID}`);
  }

  const removeSession = async (sessionID) => {
    const url = `${requestURL}/removeSession?sessionID=${sessionID}`;
    const response = await fetch(url, { method: 'DELETE' }).then(response => response.json());
    console.log(response)
    fetchSessions();
  }

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const clearFilter = () => {
    initFilters();
  };

  const initFilters = () => {
    setFilters({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const dateBodyTemplate = (rowData) => {
    const date = new Date(rowData.date).toLocaleDateString("en-UK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).toString();
    return date
  };

  const urlBodyTemplate = (rowData) => {
    const sessionID = rowData.id;
    return (
      <i
        className="lumi-session-table-icon-link pi pi-pen-to-square"
        onClick={() => editSessionDoc(sessionID)}
      />
    );
  };

  const removeBodyTemplate = (rowData) => {
    const sessionID = rowData.id;
    return (
      <i
        className="lumi-session-table-icon-remove pi pi-trash"
        onClick={() => removeSession(sessionID)}
      />
    );
  };

  const renderHeader = () => {
    return (
      <div className="lumi-session-table-header">
        <div className="lumi-session-table-header left">
          <h3 className='lumi-session-table-header-title'>
            Document sessions
          </h3>
        </div>
        <div className="lumi-session-table-header right">
          <Button
            type="button"
            icon="pi pi-plus"
            label="New session"
            severity="success"
            onClick={createNewSession}
          />
          <Button
            type="button"
            icon="pi pi-filter-slash"
            label="Clear"
            outlined
            onClick={clearFilter}
          />
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Keyword Search"
            />
          </IconField>
        </div>
      </div>
    );
  };

  return (
    <div className="lumi-session-root">
      <div className='lumi-session-head'>
        <img className='lumi-session-head-logo' src='/img/logo.png' />
        <h2 className='lumi-session-head-title'>
          lumi doc
        </h2>
      </div>
      <DataTable
        className='lumi-session-table'
        value={sessions}
        paginator
        showGridlines
        rows={10}
        loading={loading}
        dataKey="id"
        filters={filters}
        globalFilterFields={["id", "date", "user"]}
        header={renderHeader()}
        emptyMessage="No sessions found!"
        removableSort
        sortField="id"
        sortOrder={-1}
        selection={selectedRow}
        onSelectionChange={e => setSelectedRow(e.value)}
        selectionMode="single"
      >
        <Column 
          field="id" 
          header="Session ID" 
          style={{ minWidth: "12rem" }}
          sortable 
        />
        <Column
          filed="user"
          header="Created by"
          style={{ minWidth: "10rem" }}
          sortable 
        />
        <Column
          header="Created at"
          filterField="date"
          style={{ minWidth: "10rem" }}
          body={dateBodyTemplate}
          sortable 
        />
        <Column
          field="url"
          header="Edit"
          bodyClassName="url"
          headerClassName='url'
          style={{ width: "5rem", textAlign: 'center' }}
          body={urlBodyTemplate}
        />
        <Column
          field="url"
          header="Remove"
          bodyClassName="remove"
          headerClassName='remove'
          style={{ width: "5rem", textAlign: 'center' }}
          body={removeBodyTemplate}
        />
      </DataTable>
    </div>
  );
}

export default App