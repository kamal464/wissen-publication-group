'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly',
        life: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_URL.endsWith('/api') ? '' : '/api'}/messages`
        : 'http://localhost:3001/api/messages';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          content: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      toast.current?.show({
        severity: 'success',
        summary: 'Message Sent Successfully!',
        detail: 'Thank you for contacting us. We will get back to you soon.',
        life: 5000,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setErrors({});

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to send message. Please try again later.',
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Toast ref={toast} position="top-right" />
      
      <div className="contact-page">
        <div className="contact-hero">
          <div className="container">
            <h1 className="contact-title">Get in Touch</h1>
            <p className="contact-subtitle">
              Have a question or feedback? We'd love to hear from you.
            </p>
          </div>
        </div>

        <div className="container contact-container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <Card className="contact-form-card">
                <h2>Send Us a Message</h2>
                <p className="form-description">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="contact-form">
                  {/* Name Field */}
                  <div className="form-field">
                    <label htmlFor="name" className="form-label">
                      Name <span className="required">*</span>
                    </label>
                    <InputText
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.name ? 'p-invalid' : ''}
                      disabled={loading}
                    />
                    {errors.name && (
                      <small className="p-error">{errors.name}</small>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="form-field">
                    <label htmlFor="email" className="form-label">
                      Email <span className="required">*</span>
                    </label>
                    <InputText
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className={errors.email ? 'p-invalid' : ''}
                      disabled={loading}
                    />
                    {errors.email && (
                      <small className="p-error">{errors.email}</small>
                    )}
                  </div>

                  {/* Subject Field */}
                  <div className="form-field">
                    <label htmlFor="subject" className="form-label">
                      Subject <span className="required">*</span>
                    </label>
                    <InputText
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="What is this regarding?"
                      className={errors.subject ? 'p-invalid' : ''}
                      disabled={loading}
                    />
                    {errors.subject && (
                      <small className="p-error">{errors.subject}</small>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="form-field">
                    <label htmlFor="message" className="form-label">
                      Message <span className="required">*</span>
                    </label>
                    <InputTextarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Type your message here..."
                      rows={6}
                      className={errors.message ? 'p-invalid' : ''}
                      disabled={loading}
                    />
                    {errors.message && (
                      <small className="p-error">{errors.message}</small>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="form-actions">
                    <Button
                      type="submit"
                      label={loading ? 'Sending...' : 'Send Message'}
                      icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
                      loading={loading}
                      className="submit-button"
                      size="large"
                    />
                  </div>
                </form>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="contact-info-section">
              <Card className="contact-info-card">
                <h3>Contact Information</h3>
                <Divider />

                <div className="info-item">
                  <div className="info-icon">
                    <i className="pi pi-map-marker"></i>
                  </div>
                  <div className="info-content">
                    <h4>Address</h4>
                    <p>123 Publishing Street<br />Academic District<br />New York, NY 10001</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <i className="pi pi-phone"></i>
                  </div>
                  <div className="info-content">
                    <h4>Phone</h4>
                    <p>+1 (555) 123-4567</p>
                    <p className="info-note">Mon-Fri, 9:00 AM - 5:00 PM EST</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <i className="pi pi-envelope"></i>
                  </div>
                  <div className="info-content">
                    <h4>Email</h4>
                    <p>editorial@universalpublishers.com</p>
                    <p>support@universalpublishers.com</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <i className="pi pi-clock"></i>
                  </div>
                  <div className="info-content">
                    <h4>Business Hours</h4>
                    <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p>Saturday - Sunday: Closed</p>
                  </div>
                </div>
              </Card>

              <Card className="social-media-card">
                <h3>Follow Us</h3>
                <Divider />
                <div className="social-links">
                  <a href="#" className="social-link twitter">
                    <i className="pi pi-twitter"></i>
                  </a>
                  <a href="#" className="social-link facebook">
                    <i className="pi pi-facebook"></i>
                  </a>
                  <a href="#" className="social-link linkedin">
                    <i className="pi pi-linkedin"></i>
                  </a>
                  <a href="#" className="social-link github">
                    <i className="pi pi-github"></i>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
