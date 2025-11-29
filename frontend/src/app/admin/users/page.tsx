'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { adminAPI } from '@/lib/api';
import '@/styles/admin-global.scss';

interface User {
  id: number;
  userName: string;
  journalShort: string | null;
  journalName: string | null;
  category: string | null;
  isActive: boolean;
}

interface Journal {
  id: number;
  title: string;
}

interface JournalShortcode {
  id: number;
  shortcode: string;
  journalName: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [shortcodes, setShortcodes] = useState<JournalShortcode[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    password: '',
    managingJournalName: '',
    journalDomainName: '',
    journalUrl: '',
    journalId: null as number | null,
    journalShort: '' as string,
    category: '',
    isActive: true
  });
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadUsers();
    loadJournals();
    loadCategories();
    loadShortcodes();
  }, [searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers(searchQuery || undefined);
      setUsers((response.data as User[]) || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to load users. Make sure the backend server is running.';
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: errorMessage,
        life: 5000
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadJournals = async () => {
    try {
      setLoadingJournals(true);
      const response = await adminAPI.getJournals();
      const journalsData = Array.isArray(response.data) ? response.data : [];
      setJournals(journalsData.map((j: any) => ({ id: j.id, title: j.title })));
    } catch (error) {
      console.error('Error loading journals:', error);
      setJournals([]);
    } finally {
      setLoadingJournals(false);
    }
  };

  const loadShortcodes = async () => {
    try {
      const resp = await adminAPI.getJournalShortcodes();
      const list = Array.isArray(resp.data) ? resp.data : [];
      setShortcodes(
        list.map((s: any) => ({
          id: s.id,
          shortcode: s.shortcode,
          journalName: s.journalName,
        }))
      );
    } catch (e) {
      // ignore but keep empty list
      setShortcodes([]);
    }
  };

  const loadCategories = async () => {
    try {
      // Fetch all users to get unique categories from database
      const response = await adminAPI.getUsers();
      const usersData = (response.data as User[]) || [];
      
      // Extract unique categories from users
      const uniqueCategories = new Set<string>();
      usersData.forEach((user: User) => {
        if (user.category && user.category.trim()) {
          uniqueCategories.add(user.category.trim());
        }
      });
      
      // Add default categories if none found
      const defaultCategories = ['Neurology & Psychology', 'Business & Management', 'Engineering', 'Life Sciences', 'Medical'];
      const allCategories = Array.from(uniqueCategories);
      
      // Combine unique categories from DB with defaults (avoid duplicates)
      defaultCategories.forEach(cat => {
        if (!allCategories.includes(cat)) {
          allCategories.push(cat);
        }
      });
      
      setCategories(allCategories.sort());
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to default categories
      setCategories(['Neurology & Psychology', 'Business & Management', 'Engineering', 'Life Sciences', 'Medical']);
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['#', 'User Name', 'Journal Short', 'Journal Name', 'Category', 'Status'];
    const rows = users.map((user, index) => [
      index + 1,
      user.userName,
      user.journalShort || '',
      user.journalName || '',
      user.category || '',
      user.isActive ? 'Active' : 'Inactive'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.current?.show({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Users exported successfully' 
    });
  };

  const handleAddUser = () => {
    setEditingUser({
      firstName: '',
      lastName: '',
      userName: '',
      password: '',
      managingJournalName: '',
      journalDomainName: '',
      journalUrl: '',
      journalId: null,
      journalShort: '',
      category: '',
      isActive: true
    });
    setSelectedUser(null);
    setShowDialog(true);
  };

  const handleEditUser = async (user: User) => {
    try {
      // Fetch full user details from database
      const response = await adminAPI.getUser(user.id);
      const userData = response.data as any;
      
      // Populate form with database data
      setEditingUser({
        firstName: '', // These fields might not be in the User model yet
        lastName: '', // These fields might not be in the User model yet
        userName: userData?.userName || user.userName,
        password: '', // Don't populate password for security
        managingJournalName: userData?.journalName || '',
        journalDomainName: userData?.journalName || '',
        journalUrl: '', // This field might not be in the User model yet
        journalId: null, // Try to find matching journal by name
        journalShort: userData.journalShort || user.journalShort || '',
        category: userData.category || user.category || '',
        isActive: userData.isActive !== undefined ? userData.isActive : user.isActive
      });
      
      // If we have a journal name, try to find matching journal ID
      if (userData.journalName) {
        const matchingJournal = journals.find(j => 
          j.title.toLowerCase().includes(userData.journalName.toLowerCase()) ||
          userData.journalName.toLowerCase().includes(j.title.toLowerCase())
        );
        if (matchingJournal) {
          setEditingUser(prev => ({ ...prev, journalId: matchingJournal.id }));
        }
      }
      
      setSelectedUser(user);
      setShowDialog(true);
    } catch (error: any) {
      console.error('Error loading user details:', error);
      // Fallback to basic user data if API fails
      setEditingUser({
        firstName: '',
        lastName: '',
        userName: user.userName,
        password: '',
        managingJournalName: user.journalName || '',
        journalDomainName: user.journalName || '',
        journalUrl: '',
        journalId: null,
        journalShort: user.journalShort || '',
        category: user.category || '',
        isActive: user.isActive
      });
      setSelectedUser(user);
      setShowDialog(true);
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Could not load full user details. Some fields may be empty.',
        life: 3000
      });
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      if (!editingUser.userName || !editingUser.userName.trim()) {
        toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Username is required' });
        return;
      }

      if (!selectedUser && (!editingUser.password || !editingUser.password.trim())) {
        toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Password is required for new users' });
        return;
      }

      // Prepare user data for API - include password
      const userData: any = {
        userName: editingUser.userName.trim(),
        journalShort: editingUser.journalShort || null,
        journalName: editingUser.managingJournalName || editingUser.journalDomainName || null,
        category: editingUser.category || null,
        isActive: editingUser.isActive !== undefined ? editingUser.isActive : true
      };

      // Add password if provided (for both create and update)
      if (editingUser.password && editingUser.password.trim()) {
        userData.password = editingUser.password.trim();
      }

      // If journal ID is selected, prefer its title for journalName (does not change journalShort)
      if (editingUser.journalId && journals.length > 0) {
        const selectedJournal = journals.find(j => j.id === editingUser.journalId);
        if (selectedJournal) {
          userData.journalName = selectedJournal.title;
        }
      }

      if (selectedUser) {
        await adminAPI.updateUser(selectedUser.id, userData);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
      } else {
        await adminAPI.createUser(userData);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
      }
      
      setShowDialog(false);
      setSelectedUser(null);
      setEditingUser({
        firstName: '',
        lastName: '',
        userName: '',
        password: '',
        managingJournalName: '',
        journalDomainName: '',
        journalUrl: '',
        journalId: null,
        journalShort: '',
        category: '',
        isActive: true
      });
      loadUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save user';
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: errorMessage,
        life: 5000
      });
    }
  };

  const handleDeleteUser = (user: User) => {
    confirmDialog({
      message: `Are you sure you want to delete user "${user.userName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button p-button-danger',
      rejectClassName: 'p-button p-button-secondary p-button-text',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: async () => {
        try {
          await adminAPI.deleteUser(user.id);
          toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User deleted successfully' });
          loadUsers();
        } catch (error) {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete user' });
        }
      },
      reject: () => {
        // Cancel action
      }
    });
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await adminAPI.toggleUserStatus(user.id);
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: `User ${user.isActive ? 'deactivated' : 'activated'} successfully` 
      });
      loadUsers();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to toggle user status' });
    }
  };

  const actionBodyTemplate = (rowData: User) => {
    if (rowData.id === 1 && rowData.userName === 'admin') {
      return <span style={{ color: '#64748b' }}>Restricted</span>;
    }
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Button 
          icon="pi pi-eye" 
          className="p-button-rounded p-button-success p-button-text p-button-sm" 
          onClick={() => handleViewUser(rowData)}
          title="View"
        />
        <Button 
          icon={rowData.isActive ? "pi pi-eye-slash" : "pi pi-eye"} 
          className="p-button-rounded p-button-info p-button-text p-button-sm" 
          onClick={() => handleToggleStatus(rowData)}
          title={rowData.isActive ? "Deactivate" : "Activate"}
        />
        <Button 
          icon="pi pi-pencil" 
          className="p-button-rounded p-button-info p-button-text p-button-sm" 
          onClick={() => handleEditUser(rowData)}
          title="Edit"
        />
        <Button 
          icon="pi pi-trash" 
          className="p-button-rounded p-button-danger p-button-text p-button-sm" 
          onClick={() => handleDeleteUser(rowData)}
          title="Delete"
        />
      </div>
    );
  };

  const journalNameBodyTemplate = (rowData: User) => {
    if (rowData.id === 1 && rowData.userName === 'admin') {
      return <span>{rowData.journalName || '-'}</span>;
    }
    return (
      <a 
        href="#" 
        onClick={(e) => {
          e.preventDefault();
          handleViewUser(rowData);
        }}
        style={{ color: '#3b82f6', textDecoration: 'none' }}
      >
        {rowData.journalName || '-'}
      </a>
    );
  };

  const journalOptions = journals.map(j => ({ label: j.title, value: j.id }));
  const usedShortcodes = new Set((users || []).map(u => (u.journalShort || u.userName || '').trim().toLowerCase()).filter(Boolean));
  const availableShortcodes = (shortcodes || []).filter(s => !usedShortcodes.has((s.shortcode || '').toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">List of Users</h1>
        <div className="flex gap-4">
          <Button 
            label="+ Add User" 
            icon="pi pi-user-plus" 
            className="p-button-success !bg-emerald-500 !border-emerald-500 !text-white font-medium rounded-lg shadow"
            onClick={handleAddUser}
          />
          <Button 
            label="Export" 
            icon="pi pi-download" 
            className="p-button-info !bg-blue-600 !border-blue-600 !text-white font-medium rounded-lg shadow"
            onClick={handleExport}
          />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-lg shadow">
        <span className="p-input-icon-left flex-1">
          <i className="pi pi-search" />
          <InputText
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full py-3"
          />
        </span>
        <Button 
          label="Search" 
          icon="pi pi-search" 
          onClick={loadUsers}
          className="!bg-slate-500 !border-slate-500 !text-white font-medium rounded-lg px-6 py-3"
        />
        {searchQuery && (
          <Button 
            icon="pi pi-times" 
            className="p-button-text"
            onClick={() => setSearchQuery('')}
            title="Clear"
          />
        )}
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow">
        <DataTable
          value={users}
          loading={loading}
          paginator
          rows={10}
          emptyMessage="No users found"
          className="w-full"
        >
          <Column 
            field="id" 
            header="#" 
            sortable 
            style={{ width: '60px' }}
            body={(rowData, { rowIndex }) => (
              <span>{(rowIndex + 1)}</span>
            )}
          />
          <Column field="userName" header="User Name" sortable />
          <Column 
            field="journalShort" 
            header="Journal Short" 
            sortable 
            body={(rowData) => rowData.journalShort || '-'}
          />
          <Column 
            field="journalName" 
            header="Journal Name" 
            body={journalNameBodyTemplate} 
            sortable 
          />
          <Column 
            field="category" 
            header="Category" 
            sortable 
            body={(rowData) => rowData.category || '-'}
          />
          <Column header="Actions" body={actionBodyTemplate} style={{ width: '200px' }} />
        </DataTable>
      </div>

      {/* New User Registration Dialog */}
      <Dialog
        header={selectedUser ? 'Edit User' : 'New User Registration'}
        visible={showDialog}
        className="w-full sm:w-[800px]"
        onHide={() => {
          setShowDialog(false);
          setSelectedUser(null);
          setEditingUser({
            firstName: '',
            lastName: '',
            userName: '',
            password: '',
            managingJournalName: '',
            journalDomainName: '',
            journalUrl: '',
            journalId: null,
            journalShort: '',
            category: '',
            isActive: true
          });
        }}
        footer={
          <div className="flex justify-end gap-2 p-4 border-t border-slate-200">
            <Button 
              label="Cancel" 
              icon="pi pi-times" 
              onClick={() => {
                setShowDialog(false);
                setSelectedUser(null);
                setEditingUser({
                  firstName: '',
                  lastName: '',
                  userName: '',
                  password: '',
                  managingJournalName: '',
                  journalDomainName: '',
                  journalUrl: '',
                  journalId: null,
                  journalShort: '',
                  category: '',
                  isActive: true
                });
              }}
              className="p-button-text min-w-[100px]"
            />
            <Button 
              label={selectedUser ? 'Update' : 'Register'} 
              icon="pi pi-check" 
              onClick={handleSaveUser}
              className="p-button-primary !bg-blue-600 !border-blue-600 !text-white min-w-[120px]"
            />
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
          {/* Left Column */}
          <div className="flex flex-col">
            <label className="block mb-2 font-normal text-slate-700 text-sm">
              First Name
            </label>
            <InputText
              value={editingUser.firstName}
              onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
              className="w-full py-3"
              placeholder="Enter first name"
            />
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <label className="block mb-2 font-normal text-slate-700 text-sm">
              Last Name
            </label>
            <InputText
              value={editingUser.lastName}
              onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
              className="w-full py-3"
              placeholder="Enter last name"
            />
          </div>

          {/* Left Column */}
          <div className="flex flex-col">
            <label className="block mb-2 font-normal text-slate-700 text-sm">
              Managing Journal Name
            </label>
            <InputText
              value={editingUser.managingJournalName}
              onChange={(e) => setEditingUser({ ...editingUser, managingJournalName: e.target.value })}
              className="w-full py-3"
              placeholder="Enter managing journal name"
            />
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <label className="block mb-2 font-normal text-slate-700 text-sm">
              Journal Domain Name
            </label>
            <InputText
              value={editingUser.journalDomainName}
              onChange={(e) => setEditingUser({ ...editingUser, journalDomainName: e.target.value })}
              className="w-full py-3"
              placeholder="Enter journal domain name"
            />
          </div>

          {/* Left Column */}
          <div className="flex flex-col">
            <label className="block mb-2 font-normal text-slate-700 text-sm">
              Journal URL
            </label>
            <InputText
              value={editingUser.journalUrl}
              onChange={(e) => setEditingUser({ ...editingUser, journalUrl: e.target.value })}
              className="w-full py-3"
              placeholder="Enter journal URL"
            />
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <label className="block mb-2 font-normal text-slate-700 text-sm">
              Select Category
            </label>
            <Dropdown
              value={editingUser.category}
              options={categories.map(c => ({ label: c, value: c }))}
              onChange={(e) => setEditingUser({ ...editingUser, category: e.value })}
              placeholder="Select Category"
              className="w-full category-dropdown"
              panelStyle={{ zIndex: 10000 }}
              appendTo="self"
              filter
              filterPlaceholder="Search categories..."
              showClear={!!editingUser.category}
            />
          </div>

          {/* Left Column - Username (Shortcode) */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              Username (Shortcode)
            </label>
            <Dropdown
              value={editingUser.userName}
              onChange={(e) => {
                const sc = (availableShortcodes || []).find((s) => s.shortcode === e.value);
                setEditingUser((prev) => ({
                  ...prev,
                  userName: e.value,
                  journalShort: e.value || '',
                  managingJournalName: sc?.journalName || prev.managingJournalName,
                }));
              }}
              options={(availableShortcodes || []).map((s) => ({
                label: `${s.shortcode}${s.journalName ? ` - ${s.journalName}` : ''}`,
                value: s.shortcode,
              }))}
              placeholder="Select journal shortcode"
              className="w-full"
              filter
              disabled={!!selectedUser}
            />
            <p className="text-xs text-gray-500 mt-1">
              Username must match the journal shortcode. Select from available shortcodes.
            </p>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <label className="block mb-2 font-normal text-slate-700 text-sm">
              Password {!selectedUser ? '*' : '(leave blank to keep current)'}
            </label>
            <Password
              value={editingUser.password}
              onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
              className="w-full"
              inputClassName="w-full py-3 border border-slate-300 rounded-lg"
              feedback={false}
              toggleMask
              panelStyle={{ zIndex: 10000 }}
              appendTo="self"
              placeholder={selectedUser ? "Enter new password (optional)" : "Enter password"}
            />
          </div>

          {/* Left Column - Full Width */}
          <div className="flex flex-col sm:col-span-2">
            <label className="block mb-2 font-normal text-slate-700 text-sm">
              Select Your Journal
            </label>
            <Dropdown
              value={editingUser.journalId}
              options={[{ label: 'Select Journal', value: null }, ...journalOptions]}
              onChange={(e) => setEditingUser({ ...editingUser, journalId: e.value })}
              placeholder="Select Journal"
              className="w-full journal-dropdown"
              panelStyle={{ zIndex: 10000 }}
              appendTo="self"
              loading={loadingJournals}
              filter
              filterPlaceholder="Search journals..."
              showClear={!!editingUser.journalId}
            />
          </div>
        </div>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        header="User Details"
        visible={showViewDialog}
        className="w-full sm:w-[500px]"
        onHide={() => setShowViewDialog(false)}
        footer={<Button label="Close" onClick={() => setShowViewDialog(false)} />}
      >
        {selectedUser && (
          <div className="flex flex-col gap-4">
            <div>
              <strong>Username:</strong> {selectedUser.userName}
            </div>
            <div>
              <strong>Journal Short:</strong> {selectedUser.journalShort || '-'}
            </div>
            <div>
              <strong>Journal Name:</strong> {selectedUser.journalName || '-'}
            </div>
            <div>
              <strong>Category:</strong> {selectedUser.category || '-'}
            </div>
            <div>
              <strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
