'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '@/styles/admin-global.scss';

interface Fulltext {
  id: number;
  article: string;
  journalName: string;
  pdfUrl?: string;
  wordUrl?: string;
}

export default function PendingFulltextsPage() {
  const [fulltexts] = useState<Fulltext[]>([
    {
      id: 1,
      article: 'A Novel Collaboration of Specialists towards Proactive Stroke Health Equity and Literacy during COVID 19 Pandemic in Rural South Eastern Greece',
      journalName: 'jnpr'
    },
    {
      id: 2,
      article: 'Manic Shift Due to Ginseng Extract in The Patient with Depression',
      journalName: 'jnpr'
    },
    {
      id: 3,
      article: 'A Metrologist Viewpoint on how Maps can support Evaluation of Earth\'s Surface Features and Evolution in Time better than Global Numerical Parameters',
      journalName: 'jgwcc'
    },
    {
      id: 4,
      article: 'Current Status and Challenges of Assisted Reproductive Technology (ART) Services in Nepal',
      journalName: 'jgyrr'
    },
    {
      id: 5,
      article: 'Epidemiological Profile of Hiv/Hbv Co-Infection among Patients Attending Hospital Consultations in Brazzaville',
      journalName: 'jvrr'
    },
    {
      id: 6,
      article: 'Biomarkers Update on Management of Sepsis',
      journalName: 'jmhc'
    },
    {
      id: 7,
      article: 'Cloud-Native Java Application Security through DevSecOps Practices',
      journalName: 'jmca'
    },
    {
      id: 8,
      article: 'Cross-Platform vs Native iOS Development: Impacts on Cloud Integration',
      journalName: 'jmca'
    },
  ]);

  const pdfBodyTemplate = (rowData: Fulltext) => {
    return (
      <Button
        label="PDF"
        icon="pi pi-file-pdf"
        className="p-button-secondary p-button-sm"
        onClick={() => window.open(rowData.pdfUrl, '_blank')}
      />
    );
  };

  const updateBodyTemplate = (rowData: Fulltext) => {
    return (
      <Button
        label="Update Fulltext"
        icon="pi pi-pencil"
        className="p-button-info p-button-sm"
        onClick={() => {
          // Navigate to update page
          window.location.href = `/admin/pending-fulltexts/${rowData.id}/edit`;
        }}
      />
    );
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem' }}>
        Full Texts Task for Sridhar
      </h1>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <DataTable
          value={fulltexts}
          paginator
          rows={10}
          emptyMessage="No fulltexts found"
        >
          <Column field="id" header="S No" style={{ width: '80px' }} />
          <Column field="article" header="Article" style={{ minWidth: '400px' }} />
          <Column field="journalName" header="Journal Name" style={{ width: '150px' }} />
          <Column header="View PDF" body={pdfBodyTemplate} style={{ width: '120px' }} />
          <Column header="Download Word" style={{ width: '150px' }} />
          <Column header="Update Fulltext" body={updateBodyTemplate} style={{ width: '180px' }} />
        </DataTable>
      </div>
    </div>
  );
}


