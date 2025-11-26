'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '@/styles/admin-global.scss';

interface BoardMember {
  id: number;
  name: string;
  position: string;
  affiliation: string;
  journal: string;
}

export default function BoardMembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [boardMembers] = useState<BoardMember[]>([
    // Mock data - replace with real data
    { id: 1, name: 'Dr. John Smith', position: 'Editor-in-Chief', affiliation: 'University A', journal: 'Journal 1' },
    { id: 2, name: 'Dr. Jane Doe', position: 'Associate Editor', affiliation: 'University B', journal: 'Journal 2' },
  ]);

  const filteredMembers = boardMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.journal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const actionBodyTemplate = (rowData: BoardMember) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button icon="pi pi-eye" className="p-button-rounded p-button-success p-button-text" />
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-text" />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" />
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
          Board Members
        </h1>
        <Button label="+ Add Board Member" icon="pi pi-user-plus" className="p-button-success" />
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span className="p-input-icon-left" style={{ flex: 1 }}>
          <i className="pi pi-search" />
          <InputText
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search board members..."
            style={{ width: '100%' }}
          />
        </span>
        <Button label="Search" icon="pi pi-search" />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <DataTable
          value={filteredMembers}
          paginator
          rows={10}
          emptyMessage="No board members found"
        >
          <Column field="id" header="#" style={{ width: '60px' }} />
          <Column field="name" header="Name" sortable />
          <Column field="position" header="Position" sortable />
          <Column field="affiliation" header="Affiliation" />
          <Column field="journal" header="Journal" sortable />
          <Column header="Actions" body={actionBodyTemplate} style={{ width: '200px' }} />
        </DataTable>
      </div>
    </div>
  );
}


