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
  shortcode?: string;
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
  const [mounted, setMounted] = useState(false);
  const [editingUser, setEditingUser] = useState({
    userName: '',
    password: '',
    journalId: null as number | null,
    journalShort: '' as string,
    category: '',
    isActive: true
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [dialogReady, setDialogReady] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    setMounted(true);
    // Ensure dialog is ready after a small delay to allow DOM to fully initialize
    const timer = setTimeout(() => {
      setDialogReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadUsers();
      loadJournals();
      loadCategories();
      loadShortcodes();
    }
  }, [searchQuery, mounted]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers(searchQuery || undefined);
      const usersData = (response.data as User[]) || [];
      console.log('🔵 Loaded users, count:', usersData.length);
      // Log the category of the newly created user if we can find it
      if (usersData.length > 0) {
        const latestUser = usersData[0]; // First user is usually the latest due to orderBy createdAt desc
        console.log('🔵 Latest user category:', latestUser.category, 'userName:', latestUser.userName);
        // Log all users to see their categories
        console.log('🔵 All users with categories:', usersData.map(u => ({ userName: u.userName, category: u.category })));
      }
      setUsers(usersData);
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
    // Ensure component is mounted and DOM is ready
    if (!mounted || typeof document === 'undefined' || !document.body) {
      // Wait for next tick to ensure DOM is ready
      setTimeout(() => {
        handleAddUser();
      }, 100);
      return;
    }
    
    setEditingUser({
      userName: '',
      password: '',
      journalId: null,
      journalShort: '',
      category: '',
      isActive: true
    });
    setValidationErrors({});
    setSelectedUser(null);
    setShowDialog(true);
  };

  const handleEditUser = async (user: User) => {
    // Ensure component is mounted and DOM is ready
    if (!mounted || !dialogReady || typeof document === 'undefined' || !document.body) {
      // Wait for next tick to ensure DOM is ready
      setTimeout(() => {
        handleEditUser(user);
      }, 100);
      return;
    }
    
    try {
      // Fetch full user details from database
      const response = await adminAPI.getUser(user.id);
      const userData = response.data as any;
      
      // Determine journalShort - prioritize userData, then user.journalShort, then userName (since they should match)
      const journalShort = userData?.journalShort || user.journalShort || user.userName || '';
      
      // Find matching shortcode to get journal name
      const matchingShortcode = shortcodes.find(s => s.shortcode === journalShort);
      const journalName = userData?.journalName || user.journalName || matchingShortcode?.journalName || '';
      
      // Populate form with database data - bind ALL fields including shortcode
      const initialUser = {
        userName: userData?.userName || user.userName || journalShort, // userName should match shortcode
        password: '', // Don't populate password for security
        journalId: null as number | null,
        journalShort: journalShort, // Properly bind shortcode
        category: userData?.category || user.category || '',
        isActive: userData?.isActive !== undefined ? userData.isActive : (user.isActive !== undefined ? user.isActive : true)
      };
      
      // If we have a journal name, try to find matching journal ID
      if (journalName) {
        const matchingJournal = journals.find(j => {
          const jTitle = (j.title || '').trim().toLowerCase();
          const uName = journalName.trim().toLowerCase();
          return jTitle === uName || jTitle.includes(uName) || uName.includes(jTitle);
        });
        if (matchingJournal) {
          initialUser.journalId = matchingJournal.id;
        }
      }
      
      // Also try to match by shortcode if we have a journal with matching shortcode
      if (journalShort) {
        const matchingJournalByShortcode = journals.find(j => {
          const jShortcode = (j.shortcode || '').trim().toLowerCase();
          return jShortcode === journalShort.trim().toLowerCase();
        });
        if (matchingJournalByShortcode && !initialUser.journalId) {
          initialUser.journalId = matchingJournalByShortcode.id;
        }
      }
      
      setEditingUser(initialUser);
      setValidationErrors({});
      setSelectedUser(user);
      setShowDialog(true);
    } catch (error: any) {
      console.error('Error loading user details:', error);
      // Fallback to basic user data if API fails - still bind all available data
      const journalShort = user.journalShort || user.userName || '';
      
      setEditingUser({
        userName: user.userName || journalShort,
        password: '', // Don't populate password
        journalId: null,
        journalShort: journalShort, // Properly bind shortcode
        category: user.category || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
      setValidationErrors({});
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username is required
    if (!editingUser.userName || !editingUser.userName.trim()) {
      errors.userName = 'Username is required';
    }

    // Password is required for new users
    if (!selectedUser && (!editingUser.password || !editingUser.password.trim())) {
      errors.password = 'Password is required for new users';
    }

    // Category is required
    if (!editingUser.category || !editingUser.category.trim()) {
      errors.category = 'Category is required';
    }

    // Journal Short is required (should match userName)
    if (!editingUser.journalShort || !editingUser.journalShort.trim()) {
      errors.journalShort = 'Journal shortcode is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async () => {
    // Clear previous errors
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Please fix the errors in the form before submitting.',
        life: 5000
      });
      return;
    }

    try {
      // Ensure category is properly set - it's required and should not be null/empty
      const selectedCategory = editingUser.category && editingUser.category.trim() 
        ? editingUser.category.trim() 
        : null;
      
      if (!selectedCategory) {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Validation Error', 
          detail: 'Category is required. Please select a category.',
          life: 5000
        });
        setValidationErrors({ category: 'Category is required' });
        return;
      }

      // Prepare user data for API - include password
      // DEBUG: Log the selected category to ensure it's correct
      console.log('🔵 Saving user with category:', selectedCategory);
      console.log('🔵 Editing user category value:', editingUser.category);
      
      const userData: any = {
        userName: editingUser.userName.trim(),
        journalShort: editingUser.journalShort || null,
        journalName: null,
        category: selectedCategory, // Always use the selected category - ensure it's not null
        isActive: editingUser.isActive !== undefined ? editingUser.isActive : true
      };
      
      // DEBUG: Verify category is in userData
      console.log('🔵 User data being sent:', { ...userData, password: userData.password ? '***' : null });

      // Add password if provided (for both create and update)
      if (editingUser.password && editingUser.password.trim()) {
        userData.password = editingUser.password.trim();
      }

      // Get journal name from selected journal or shortcode
      if (editingUser.journalId && journals.length > 0) {
        const selectedJournal = journals.find(j => j.id === editingUser.journalId);
        if (selectedJournal) {
          userData.journalName = selectedJournal.title;
        }
      } else if (editingUser.journalShort) {
        // Fallback to shortcode's journal name if no journal selected
        const matchingShortcode = shortcodes.find(s => s.shortcode === editingUser.journalShort);
        if (matchingShortcode) {
          userData.journalName = matchingShortcode.journalName;
        }
      }

      if (selectedUser) {
        const updatedUser = await adminAPI.updateUser(selectedUser.id, userData);
        console.log('🔵 User updated, response:', updatedUser);
        const updatedUserData = updatedUser?.data as any;
        console.log('🔵 User updated, category in response:', updatedUserData?.category);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
      } else {
        const createdUser = await adminAPI.createUser(userData);
        console.log('🔵 User created, response:', createdUser);
        const createdUserData = createdUser?.data as any;
        console.log('🔵 User created, full response data:', createdUserData);
        console.log('🔵 User created, category in response:', createdUserData?.category);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
      }
      
      setShowDialog(false);
      setSelectedUser(null);
      setValidationErrors({});
      setEditingUser({
        userName: '',
        password: '',
        journalId: null,
        journalShort: '',
        category: '',
        isActive: true
      });
      // Force refresh users list to get latest data - add small delay to ensure DB commit
      setTimeout(async () => {
        await loadUsers();
      }, 100);
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
  
  // When editing, include the current user's shortcode even if it's "used"
  const currentUserShortcode = selectedUser ? (selectedUser.journalShort || selectedUser.userName || '').trim().toLowerCase() : '';
  const availableShortcodes = (shortcodes || []).filter(s => {
    const sc = (s.shortcode || '').toLowerCase();
    // Include if not used, OR if it's the current user's shortcode (when editing)
    return !usedShortcodes.has(sc) || (selectedUser && sc === currentUserShortcode);
  });

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
          key={`users-table-${users.length}-${users.map(u => u.id).join('-')}`}
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
            header="Category" 
            sortable 
            sortField="category"
            body={(rowData: User) => {
              // Force use of user's category field, not journal's
              const categoryValue = rowData.category || '-';
              // Debug logging to see what's being rendered
              console.log('🔵 Rendering category for user:', rowData.userName, 'ID:', rowData.id, 'category field value:', rowData.category, 'displaying:', categoryValue);
              console.log('🔵 Full user object:', JSON.stringify(rowData, null, 2));
              // Add a data attribute to help debug
              return (
                <span 
                  data-user-id={rowData.id}
                  data-user-name={rowData.userName}
                  data-category={rowData.category || 'null'}
                  style={{ fontWeight: 'bold', color: rowData.category ? '#000' : '#999' }}
                >
                  {categoryValue}
                </span>
              );
            }}
          />
          <Column header="Actions" body={actionBodyTemplate} style={{ width: '200px' }} />
        </DataTable>
      </div>

      {/* New User Registration Dialog */}
      {mounted && dialogReady && showDialog && typeof document !== 'undefined' && document.body && (
        <Dialog
          header={selectedUser ? 'Edit User' : 'New User Registration'}
          visible={showDialog}
          className="w-full sm:w-[800px]"
          appendTo={document.body}
          modal
          onHide={() => {
          setShowDialog(false);
          setSelectedUser(null);
          setValidationErrors({});
          setEditingUser({
            userName: '',
            password: '',
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
                setValidationErrors({});
                setEditingUser({
                  userName: '',
                  password: '',
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
              Select Category <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={editingUser.category || null}
              options={categories.map(c => ({ label: c, value: c }))}
              onChange={(e) => {
                const selectedCategory = e.value ? String(e.value).trim() : '';
                setEditingUser({ ...editingUser, category: selectedCategory });
                // Clear error when user selects a value
                if (validationErrors.category) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.category;
                    return newErrors;
                  });
                }
              }}
              placeholder="Select Category"
              className={`w-full category-dropdown ${validationErrors.category ? 'p-invalid' : ''}`}
              panelStyle={{ zIndex: 10000 }}
              appendTo={typeof document !== 'undefined' ? document.body : undefined}
              filter
              filterPlaceholder="Search categories..."
              showClear={!!editingUser.category}
            />
            {validationErrors.category && (
              <small className="p-error mt-1 block text-red-600 text-sm">
                {validationErrors.category}
              </small>
            )}
          </div>

          {/* Left Column - Username (Shortcode) */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username (Shortcode) <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={editingUser.userName || editingUser.journalShort || null}
              onChange={(e) => {
                setEditingUser((prev) => ({
                  ...prev,
                  userName: e.value || '',
                  journalShort: e.value || '',
                }));
                // Clear error when user selects a value
                if (validationErrors.userName) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.userName;
                    return newErrors;
                  });
                }
              }}
              options={(() => {
                const options = (availableShortcodes || []).map((s) => ({
                  label: `${s.shortcode}${s.journalName ? ` - ${s.journalName}` : ''}`,
                  value: s.shortcode,
                }));
                
                // When editing, if the current shortcode is not in availableShortcodes, add it
                if (selectedUser && editingUser.journalShort) {
                  const currentShortcode = editingUser.journalShort.trim();
                  const exists = options.some(opt => opt.value === currentShortcode);
                  if (!exists && currentShortcode) {
                    // Find the shortcode in the full shortcodes list to get journal name
                    const fullShortcode = shortcodes.find(s => s.shortcode === currentShortcode);
                    options.unshift({
                      label: `${currentShortcode}${fullShortcode?.journalName ? ` - ${fullShortcode.journalName}` : ''}`,
                      value: currentShortcode,
                    });
                  }
                }
                
                return options;
              })()}
              placeholder="Select journal shortcode"
              className={`w-full ${validationErrors.userName ? 'p-invalid' : ''}`}
              filter
              disabled={!!selectedUser}
              appendTo={typeof document !== 'undefined' ? document.body : undefined}
            />
            {validationErrors.userName && (
              <small className="p-error mt-1 block text-red-600 text-sm">
                {validationErrors.userName}
              </small>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Username must match the journal shortcode. Select from available shortcodes.
            </p>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <label className="block mb-2 font-normal text-slate-700 text-sm">
              Password {!selectedUser ? <span className="text-red-500">*</span> : <span className="text-gray-500">(leave blank to keep current)</span>}
            </label>
            <Password
              value={editingUser.password}
              onChange={(e) => {
                setEditingUser({ ...editingUser, password: e.target.value });
                // Clear error when user types
                if (validationErrors.password) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.password;
                    return newErrors;
                  });
                }
              }}
              className={`w-full ${validationErrors.password ? 'p-invalid' : ''}`}
              inputClassName={`w-full py-3 border rounded-lg ${validationErrors.password ? 'border-red-500' : 'border-slate-300'}`}
              feedback={false}
              toggleMask
              panelStyle={{ zIndex: 10000 }}
              appendTo={typeof document !== 'undefined' ? document.body : undefined}
              placeholder={selectedUser ? "Enter new password (optional)" : "Enter password"}
            />
            {validationErrors.password && (
              <small className="p-error mt-1 block text-red-600 text-sm">
                {validationErrors.password}
              </small>
            )}
          </div>

        </div>
        </Dialog>
      )}

      {/* View Dialog */}
      {mounted && dialogReady && showViewDialog && typeof document !== 'undefined' && document.body && (
        <Dialog
          header="User Details"
          visible={showViewDialog}
          className="w-full sm:w-[500px]"
          appendTo={document.body}
          modal
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
      )}
    </div>
  );
}
