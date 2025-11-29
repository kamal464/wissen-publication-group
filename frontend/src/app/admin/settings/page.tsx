'use client';

import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

interface SettingsData {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  adminEmail: string;
  timezone: string;
  dateFormat: string;
  itemsPerPage: number;
  enableNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  enableComments: boolean;
  enableRatings: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  backupFrequency: string;
  logLevel: string;
  enableAnalytics: boolean;
  googleAnalyticsId: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsData>({
    siteName: 'Wissen Publication Group',
    siteDescription: 'Leading academic publishing platform',
    contactEmail: 'contact@universalpublishers.com',
    adminEmail: 'admin@universalpublishers.com',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    itemsPerPage: 10,
    enableNotifications: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    enableComments: true,
    enableRatings: true,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt'],
    backupFrequency: 'daily',
    logLevel: 'info',
    enableAnalytics: true,
    googleAnalyticsId: 'GA-XXXXX-XXXXX'
  });

  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const timezoneOptions = [
    { label: 'UTC', value: 'UTC' },
    { label: 'EST (Eastern Time)', value: 'EST' },
    { label: 'PST (Pacific Time)', value: 'PST' },
    { label: 'GMT (Greenwich Mean Time)', value: 'GMT' },
    { label: 'CET (Central European Time)', value: 'CET' }
  ];

  const dateFormatOptions = [
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { label: 'DD-MM-YYYY', value: 'DD-MM-YYYY' }
  ];

  const backupFrequencyOptions = [
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  const logLevelOptions = [
    { label: 'Debug', value: 'debug' },
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' }
  ];

  const fileTypeOptions = [
    { label: 'PDF', value: 'pdf' },
    { label: 'DOC', value: 'doc' },
    { label: 'DOCX', value: 'docx' },
    { label: 'TXT', value: 'txt' },
    { label: 'RTF', value: 'rtf' },
    { label: 'ODT', value: 'odt' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real application, load settings from API
      // const response = await adminAPI.getSettings();
      // setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real application, save settings via API
      // await adminAPI.updateSettings(settings);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Settings saved successfully'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadSettings();
    toast.current?.show({
      severity: 'info',
      summary: 'Reset',
      detail: 'Settings reset to saved values'
    });
  };

  const handleFileTypeChange = (value: string, checked: boolean) => {
    const currentTypes = [...settings.allowedFileTypes];
    if (checked) {
      currentTypes.push(value);
    } else {
      const index = currentTypes.indexOf(value);
      if (index > -1) {
        currentTypes.splice(index, 1);
      }
    }
    setSettings({ ...settings, allowedFileTypes: currentTypes });
  };

  return (
    <div className="settings-page">
      <Toast ref={toast} />
      
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="pi pi-cog mr-3"></i>
            System Settings
          </h1>
          <p className="page-subtitle">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="header-actions">
          <Button
            label="Reset"
            icon="pi pi-refresh"
            className="btn btn-outline btn-sm"
            onClick={handleReset}
          />
          <Button
            label="Save Settings"
            icon="pi pi-save"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            loading={loading}
          />
        </div>
      </div>

      <div className="settings-grid">
        {/* General Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="pi pi-globe mr-2"></i>
              General Settings
            </h2>
            <p className="section-description">
              Basic site information and configuration
            </p>
          </div>
          
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Site Name *</label>
                <InputText
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="Enter site name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email *</label>
                <InputText
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  placeholder="contact@example.com"
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Site Description</label>
              <InputTextarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                placeholder="Brief description of your site"
                rows={3}
                className="form-textarea"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Admin Email *</label>
                <InputText
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  placeholder="admin@example.com"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <Dropdown
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.value })}
                  options={timezoneOptions}
                  placeholder="Select timezone"
                  className="form-dropdown"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="pi pi-desktop mr-2"></i>
              Display Settings
            </h2>
            <p className="section-description">
              Configure how content is displayed to users
            </p>
          </div>
          
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date Format</label>
                <Dropdown
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.value })}
                  options={dateFormatOptions}
                  placeholder="Select date format"
                  className="form-dropdown"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Items Per Page</label>
                <InputText
                  type="number"
                  value={settings.itemsPerPage.toString()}
                  onChange={(e) => setSettings({ ...settings, itemsPerPage: parseInt(e.target.value) || 10 })}
                  placeholder="10"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="pi pi-bell mr-2"></i>
              Notification Settings
            </h2>
            <p className="section-description">
              Configure notification preferences
            </p>
          </div>
          
          <div className="settings-form">
            <div className="checkbox-group">
              <div className="checkbox-item">
                <Checkbox
                  inputId="enableNotifications"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.checked || false })}
                />
                <label htmlFor="enableNotifications" className="checkbox-label">
                  Enable Notifications
                </label>
              </div>
              
              <div className="checkbox-item">
                <Checkbox
                  inputId="enableEmailNotifications"
                  checked={settings.enableEmailNotifications}
                  onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.checked || false })}
                />
                <label htmlFor="enableEmailNotifications" className="checkbox-label">
                  Enable Email Notifications
                </label>
              </div>
              
              <div className="checkbox-item">
                <Checkbox
                  inputId="enableSMSNotifications"
                  checked={settings.enableSMSNotifications}
                  onChange={(e) => setSettings({ ...settings, enableSMSNotifications: e.checked || false })}
                />
                <label htmlFor="enableSMSNotifications" className="checkbox-label">
                  Enable SMS Notifications
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="pi pi-users mr-2"></i>
              User Management
            </h2>
            <p className="section-description">
              Configure user registration and access settings
            </p>
          </div>
          
          <div className="settings-form">
            <div className="checkbox-group">
              <div className="checkbox-item">
                <Checkbox
                  inputId="allowRegistration"
                  checked={settings.allowRegistration}
                  onChange={(e) => setSettings({ ...settings, allowRegistration: e.checked || false })}
                />
                <label htmlFor="allowRegistration" className="checkbox-label">
                  Allow User Registration
                </label>
              </div>
              
              <div className="checkbox-item">
                <Checkbox
                  inputId="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.checked || false })}
                />
                <label htmlFor="requireEmailVerification" className="checkbox-label">
                  Require Email Verification
                </label>
              </div>
              
              <div className="checkbox-item">
                <Checkbox
                  inputId="enableComments"
                  checked={settings.enableComments}
                  onChange={(e) => setSettings({ ...settings, enableComments: e.checked || false })}
                />
                <label htmlFor="enableComments" className="checkbox-label">
                  Enable Comments
                </label>
              </div>
              
              <div className="checkbox-item">
                <Checkbox
                  inputId="enableRatings"
                  checked={settings.enableRatings}
                  onChange={(e) => setSettings({ ...settings, enableRatings: e.checked || false })}
                />
                <label htmlFor="enableRatings" className="checkbox-label">
                  Enable Ratings
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="pi pi-upload mr-2"></i>
              File Upload Settings
            </h2>
            <p className="section-description">
              Configure file upload limits and allowed types
            </p>
          </div>
          
          <div className="settings-form">
            <div className="form-group">
              <label className="form-label">Maximum File Size (MB)</label>
              <InputText
                type="number"
                  value={settings.maxFileSize.toString()}
                  onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) || 10 })}
                placeholder="10"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Allowed File Types</label>
              <div className="checkbox-group">
                {fileTypeOptions.map((option) => (
                  <div key={option.value} className="checkbox-item">
                    <Checkbox
                      inputId={option.value}
                      checked={settings.allowedFileTypes.includes(option.value)}
                      onChange={(e) => handleFileTypeChange(option.value, e.checked || false)}
                    />
                    <label htmlFor={option.value} className="checkbox-label">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="pi pi-server mr-2"></i>
              System Settings
            </h2>
            <p className="section-description">
              Advanced system configuration and maintenance
            </p>
          </div>
          
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Backup Frequency</label>
                <Dropdown
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({ ...settings, backupFrequency: e.value })}
                  options={backupFrequencyOptions}
                  placeholder="Select backup frequency"
                  className="form-dropdown"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Log Level</label>
                <Dropdown
                  value={settings.logLevel}
                  onChange={(e) => setSettings({ ...settings, logLevel: e.value })}
                  options={logLevelOptions}
                  placeholder="Select log level"
                  className="form-dropdown"
                />
              </div>
            </div>
            
            <div className="checkbox-group">
              <div className="checkbox-item">
                <Checkbox
                  inputId="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.checked || false })}
                />
                <label htmlFor="maintenanceMode" className="checkbox-label">
                  Maintenance Mode
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="pi pi-chart-line mr-2"></i>
              Analytics Settings
            </h2>
            <p className="section-description">
              Configure analytics and tracking
            </p>
          </div>
          
          <div className="settings-form">
            <div className="checkbox-group">
              <div className="checkbox-item">
                <Checkbox
                  inputId="enableAnalytics"
                  checked={settings.enableAnalytics}
                  onChange={(e) => setSettings({ ...settings, enableAnalytics: e.checked || false })}
                />
                <label htmlFor="enableAnalytics" className="checkbox-label">
                  Enable Analytics
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Google Analytics ID</label>
              <InputText
                value={settings.googleAnalyticsId}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                placeholder="GA-XXXXX-XXXXX"
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
