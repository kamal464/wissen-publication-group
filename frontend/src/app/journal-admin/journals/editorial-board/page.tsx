'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from 'primereact/editor';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { adminAPI } from '@/lib/api';
import { loadJournalData } from '@/lib/journalAdminUtils';
import { getFileUrl } from '@/lib/apiConfig';
import 'quill/dist/quill.snow.css';

interface BoardMember {
  id: number;
  name: string;
  position: string;
  memberType?: string;
  editorType?: string;
  affiliation?: string;
  email?: string;
  bio?: string;
  description?: string;
  biography?: string;
  imageUrl?: string;
  profileUrl?: string;
  tags?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export default function EditorialBoardPage() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<BoardMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [journalId, setJournalId] = useState<number | null>(null);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const toast = useRef<Toast>(null);

  const handleRowReorder = async (e: { value: BoardMember[] }) => {
    const reordered = e.value;
    setMembers(reordered);
    if (!journalId) return;
    try {
      setReordering(true);
      await adminAPI.reorderBoardMembers(journalId, reordered.map((m) => m.id));
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Order saved. View editorial board will show this order.' });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.response?.data?.error ?? err.message ?? 'Failed to save order';
      toast.current?.show({ severity: 'error', summary: 'Error', detail: typeof msg === 'string' ? msg : 'Failed to save order' });
      await loadJournalAndMembers();
    } finally {
      setReordering(false);
    }
  };

  const memberTypes = [
    { label: 'Select Member Type', value: null },
    { label: 'Editor-in-Chief', value: 'Editor-in-Chief' },
    { label: 'Associate Editor', value: 'Associate Editor' },
    { label: 'Section Editor', value: 'Section Editor' },
    { label: 'Executive Editor', value: 'Executive Editor' },
    { label: 'Editorial Board Member', value: 'Editorial Board Member' }
  ];

  const editorTypes = [
    { label: 'Select Editor Type', value: null },
    { label: 'Academic', value: 'Academic' },
    { label: 'Clinical', value: 'Clinical' },
    { label: 'Industry', value: 'Industry' },
    { label: 'Other', value: 'Other' }
  ];

  useEffect(() => {
    loadJournalAndMembers();
  }, []);

  const loadJournalAndMembers = async () => {
    try {
      setLoading(true);
      const journalData = await loadJournalData();
      
      if (!journalData) {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load journal data. Please check console for details.' 
        });
        return;
      }

      setJournalId(journalData.journalId);
      setJournalTitle(journalData.journalTitle);
      
      console.log('Loading board members for journal:', journalData.journalId);
      // Load board members
      const membersResponse = await adminAPI.getBoardMembers(journalData.journalId);
      console.log('Board members response:', membersResponse);
      setMembers((membersResponse.data as any[]) || []);
    } catch (error: any) {
      console.error('=== ERROR loading board members ===', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load board members';
      toast.current?.show({ severity: 'error', summary: 'Error', detail: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | undefined | null) => {
    // Return null if path is undefined, null, empty, or the string "undefined"
    if (!imagePath || imagePath === 'undefined' || imagePath === 'null' || imagePath.trim() === '') {
      return null;
    }
    
    // If it's already a data URI, return as is
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Otherwise, use getFileUrl to construct the full URL
    // Ensure the path starts with /uploads/ for proper server routing
    const normalizedPath = imagePath.startsWith('/uploads/') ? imagePath : `/uploads/${imagePath.replace(/^\/?uploads\//, '')}`;
    return getFileUrl(normalizedPath);
  };

  const handleAdd = () => {
    setSelectedMember({
      id: 0,
      name: '',
      position: 'Editorial Board Member',
      memberType: 'Editorial Board Member',
      editorType: 'Academic',
      affiliation: '',
      email: '',
      bio: '',
      description: '',
      biography: '',
      imageUrl: '',
      profileUrl: '',
      tags: '',
      isActive: true
    });
    setShowDialog(true);
  };

  const handleEdit = (member: BoardMember) => {
    setSelectedMember({ ...member });
    setShowDialog(true);
  };

  const handleDeleteClick = (member: BoardMember) => {
    setMemberToDelete(member);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      setDeleting(true);
      await adminAPI.deleteBoardMember(memberToDelete.id);
      setMembers(members.filter(m => m.id !== memberToDelete.id));
      setShowDeleteDialog(false);
      setMemberToDelete(null);
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Board member deleted successfully' });
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete board member' });
    } finally {
      setDeleting(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!selectedMember || !journalId) return;
    
    try {
      setUploading(true);
      
      // If editing existing member, upload to member
      if (selectedMember.id > 0) {
        const response = await adminAPI.uploadBoardMemberPhoto(selectedMember.id, file);
        const responseData = response.data as { path?: string };
        const imagePath = responseData.path || '';
        
        // Update selected member state with the new image URL
        setSelectedMember({ ...selectedMember, imageUrl: imagePath });
        
        // Update the members list immediately to reflect the change
        setMembers(prevMembers => 
          prevMembers.map(m => 
            m.id === selectedMember.id 
              ? { ...m, imageUrl: imagePath }
              : m
          )
        );
        
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Photo uploaded successfully' });
      } else {
        // For new member, we'll upload after creation
        // Store file temporarily as base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setSelectedMember({ ...selectedMember, imageUrl: result });
        };
        reader.readAsDataURL(file);
        toast.current?.show({ severity: 'info', summary: 'Info', detail: 'Photo will be uploaded when you save the member' });
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.response?.data?.message || 'Failed to upload photo' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    console.log('=== handleSave called ===');
    console.log('1. Current journalId state:', journalId);
    console.log('2. Selected member:', selectedMember?.id, selectedMember?.name);
    
    if (!selectedMember || !journalId) {
      console.error('3. Missing required data:', { selectedMember: !!selectedMember, journalId });
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: `Missing required data. Journal ID: ${journalId}, Member: ${selectedMember ? 'present' : 'missing'}` 
      });
      return;
    }

    try {
      setSaving(true);
      
      const memberData: any = {
        journalId,
        name: selectedMember.name,
        position: selectedMember.position || selectedMember.memberType || 'Editorial Board Member',
        memberType: selectedMember.memberType,
        editorType: selectedMember.editorType,
        affiliation: selectedMember.affiliation,
        email: selectedMember.email,
        bio: selectedMember.bio,
        description: selectedMember.description,
        biography: selectedMember.biography,
        profileUrl: selectedMember.profileUrl,
        tags: selectedMember.tags,
        imageUrl: selectedMember.imageUrl && !selectedMember.imageUrl.startsWith('data:') ? selectedMember.imageUrl : undefined,
        isActive: selectedMember.isActive !== false
      };

      if (selectedMember.id === 0) {
        // Create new member
        if (selectedMember.imageUrl && !selectedMember.imageUrl.startsWith('http')) {
          // If it's a data URL, we need to upload it after creation
          const base64Data = selectedMember.imageUrl;
          delete memberData.imageUrl; // Remove from initial create
          
          const response = await adminAPI.createBoardMember(memberData);
          const newMember = response.data as BoardMember;
          
          // Upload photo after creation
          if (base64Data.startsWith('data:')) {
            // Convert base64 to file
            const byteString = atob(base64Data.split(',')[1]);
            const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const file = new File([blob], 'photo.jpg', { type: mimeString });
            
            const uploadResponse = await adminAPI.uploadBoardMemberPhoto(newMember.id, file);
            const uploadData = uploadResponse.data as { path?: string };
            
            // Update the newly created member with the uploaded image URL
            if (uploadData.path) {
              setSelectedMember({ ...newMember, imageUrl: uploadData.path });
            }
            
            await loadJournalAndMembers(); // Reload to get updated photo
          }
        } else {
          memberData.imageUrl = selectedMember.imageUrl;
          await adminAPI.createBoardMember(memberData);
        }
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Board member added successfully' });
      } else {
        // Update existing member
        // If imageUrl was uploaded via the upload handler, make sure it's included
        if (selectedMember.imageUrl && !selectedMember.imageUrl.startsWith('data:')) {
          memberData.imageUrl = selectedMember.imageUrl;
        }
        console.log('Updating member with data:', memberData);
        await adminAPI.updateBoardMember(selectedMember.id, memberData);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Board member updated successfully' });
      }
      
      setShowDialog(false);
      await loadJournalAndMembers();
    } catch (error: any) {
      console.error('Error saving member:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save board member' });
    } finally {
      setSaving(false);
    }
  };

  const photoBodyTemplate = (rowData: BoardMember) => {
    // Check multiple possible field names for the image
    // Prefer profileUrl first (most reliable), then fall back to others
    const rawImagePath = (rowData as any).profileUrl || 
                        (rowData as any).imageUrl || 
                        (rowData as any).image || 
                        (rowData as any).photo || 
                        (rowData as any).photoUrl ||
                        (rowData as any).photoPath;
    
    // Filter out invalid values: undefined, null, empty string, or the string "undefined"/"null"
    const imagePath = (rawImagePath && 
                      rawImagePath !== 'undefined' && 
                      rawImagePath !== 'null' && 
                      typeof rawImagePath === 'string' && 
                      rawImagePath.trim() !== '' &&
                      !rawImagePath.includes('/undefined') &&
                      !rawImagePath.includes('/null'))
      ? rawImagePath 
      : null;
    
    // Only process if we have a valid path
    const imageUrl = imagePath ? getImageUrl(imagePath) : null;
    
    console.log('Photo template for member:', {
      name: rowData.name,
      imageUrl: (rowData as any).imageUrl,
      profileUrl: (rowData as any).profileUrl,
      image: (rowData as any).image,
      photo: (rowData as any).photo,
      photoUrl: (rowData as any).photoUrl,
      imagePath,
      finalImageUrl: imageUrl,
      allFields: Object.keys(rowData),
      fullRowData: rowData
    });
    
    return imageUrl ? (
      <img 
        src={imageUrl} 
        alt={rowData.name} 
        className="w-16 h-20 object-cover rounded"
        onError={(e) => {
          console.error('Image load error in table:', {
            imagePath,
            imageUrl,
            memberName: rowData.name
          });
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          // Show placeholder instead
          const placeholder = document.createElement('div');
          placeholder.className = 'w-16 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs';
          placeholder.textContent = 'No Photo';
          target.parentNode?.replaceChild(placeholder, target);
        }}
        onLoad={() => {
          console.log('Image loaded successfully in table:', {
            imagePath,
            imageUrl,
            memberName: rowData.name
          });
        }}
      />
    ) : (
      <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No Photo</div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toast ref={toast} />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          {journalTitle && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">Journal: </span>
              <span className="text-xl font-bold text-slate-800">{journalTitle}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Editorial Board Members</h1>
          <p className="text-slate-600">Manage your journal editorial board members</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <i className="pi pi-plus"></i>
          <span>Add Member</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <p className="text-sm text-slate-500 px-4 pt-2">Drag rows to reorder. The same order is shown on the journal’s View Editorial Board.</p>
        <DataTable
          value={members}
          loading={loading}
          dataKey="id"
          reorderableRows
          onRowReorder={handleRowReorder}
          emptyMessage="No board members found"
        >
          <Column rowReorder style={{ width: '3rem' }} />
          <Column header="Photo" body={photoBodyTemplate} style={{ width: '100px' }} />
          <Column field="name" header="Name" />
          <Column field="memberType" header="Member Type" />
          <Column field="editorType" header="Editor Type" />
          <Column field="position" header="Position" />
          <Column
            header="Actions"
            body={(rowData) => (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(rowData)}
                  style={{
                    backgroundColor: '#fbbf24',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Edit"
                >
                  <i className="pi pi-pencil"></i>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(rowData)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Delete"
                >
                  <i className="pi pi-trash"></i>
                </button>
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={selectedMember?.id === 0 ? 'Add Board Member' : 'Edit Board Member'}
        visible={showDialog}
        style={{ width: '90vw', maxWidth: '900px' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDialog(false)}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="pi pi-times"></i>
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              style={{
                backgroundColor: '#fbbf24',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: saving || uploading ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '120px',
                opacity: saving || uploading ? 0.7 : 1
              }}
            >
              {saving ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-check"></i>}
              <span>{saving ? 'Saving...' : 'Submit'}</span>
            </button>
          </div>
        }
      >
        {selectedMember && (
          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="block mb-2 text-sm font-medium text-gray-700">Member Type *</label>
                <Dropdown
                  value={selectedMember.memberType}
                  options={memberTypes}
                  onChange={(e) => setSelectedMember({ ...selectedMember, memberType: e.value, position: e.value || selectedMember.position })}
                  className="w-full"
                  placeholder="Select Member Type"
                />
              </div>
              <div className="flex flex-col">
                <label className="block mb-2 text-sm font-medium text-gray-700">Editor Type *</label>
                <Dropdown
                  value={selectedMember.editorType}
                  options={editorTypes}
                  onChange={(e) => setSelectedMember({ ...selectedMember, editorType: e.value })}
                  className="w-full"
                  placeholder="Select Editor Type"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">Editor Name *</label>
              <InputText
                value={selectedMember.name}
                onChange={(e) => setSelectedMember({ ...selectedMember, name: e.target.value })}
                className="w-full"
                placeholder="Enter editor name"
              />
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">Editor Photo</label>
              <p className="text-xs text-gray-500 mb-2">Max size: 4MB. Recommended size: 85×119 px</p>
              {selectedMember.imageUrl && getImageUrl(selectedMember.imageUrl) && (
                <img 
                  src={getImageUrl(selectedMember.imageUrl) || ''} 
                  alt="Preview" 
                  className="mb-2 w-20 h-28 object-cover rounded border border-gray-200"
                  onError={(e) => {
                    console.error('Image load error:', selectedMember.imageUrl);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', selectedMember.imageUrl);
                  }}
                />
              )}
              <FileUpload
                mode="basic"
                name="editorPhoto"
                accept="image/*"
                maxFileSize={4000000}
                chooseLabel="Choose File"
                onSelect={(e) => {
                  if (e.files && e.files[0]) {
                    handlePhotoUpload(e.files[0]);
                  }
                }}
                disabled={uploading}
                className="w-full"
              />
              {!selectedMember.imageUrl && <p className="text-xs text-gray-400 mt-1">No file chosen</p>}
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">Editor Description *</label>
              <Editor
                value={selectedMember.description || ''}
                onTextChange={(e) => setSelectedMember({ ...selectedMember, description: e.htmlValue || '' })}
                style={{ height: '200px' }}
                placeholder="Enter editor description..."
              />
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">Editor Biography *</label>
              <Editor
                value={selectedMember.biography || ''}
                onTextChange={(e) => setSelectedMember({ ...selectedMember, biography: e.htmlValue || '' })}
                style={{ height: '250px' }}
                placeholder="Enter editor biography..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="block mb-2 text-sm font-medium text-gray-700">Affiliation</label>
                <InputText
                  value={selectedMember.affiliation || ''}
                  onChange={(e) => setSelectedMember({ ...selectedMember, affiliation: e.target.value })}
                  className="w-full"
                  placeholder="Enter affiliation"
                />
              </div>
              <div className="flex flex-col">
                <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                <InputText
                  value={selectedMember.email || ''}
                  onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })}
                  className="w-full"
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">EB Profile URL</label>
              <InputText
                value={selectedMember.profileUrl || ''}
                onChange={(e) => setSelectedMember({ ...selectedMember, profileUrl: e.target.value })}
                className="w-full"
                placeholder="Enter profile URL"
              />
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">Tags</label>
              <InputText
                value={selectedMember.tags || ''}
                onChange={(e) => setSelectedMember({ ...selectedMember, tags: e.target.value })}
                className="w-full"
                placeholder="Enter tags (comma-separated)"
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        header="Confirm Delete"
        visible={showDeleteDialog}
        style={{ width: '90vw', maxWidth: '500px' }}
        onHide={() => {
          setShowDeleteDialog(false);
          setMemberToDelete(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowDeleteDialog(false);
                setMemberToDelete(null);
              }}
              disabled={deleting}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: deleting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: deleting ? 0.6 : 1
              }}
            >
              <i className="pi pi-times"></i>
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: deleting ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '120px'
              }}
            >
              {deleting ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-trash"></i>}
              <span>{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        }
      >
        <div className="py-4">
          <div className="flex items-center gap-4 mb-4">
            <i className="pi pi-exclamation-triangle text-4xl text-red-500"></i>
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Are you sure you want to delete this board member?</p>
              {memberToDelete && (
                <p className="text-gray-600">
                  <strong>{memberToDelete.name}</strong> will be permanently deleted.
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
        </div>
      </Dialog>
    </div>
  );
}
