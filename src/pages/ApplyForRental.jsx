import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Property } from "@/api/entities";
import { RentalApplication } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileUp,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
  Plus,
  Star,
  Upload
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const STEPS = [
  "Personal Information",
  "Residential History", 
  "Employment & Income",
  "Occupants & Lease Details",
  "Pet Information",
  "Document Upload",
  "Review & Submit",
];

const RequiredLabel = ({ children, required = false }) => (
  <label className="block text-sm font-medium text-slate-700 mb-2">
    {children}
    {required && <Star className="w-3 h-3 inline ml-1 text-red-500 fill-red-500" />}
  </label>
);

export default function ApplyForRental() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [property, setProperty] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  // Document uploads
  const [payStubs, setPayStubs] = useState([]);
  const [creditReport, setCreditReport] = useState(null);
  const [driversLicenseFront, setDriversLicenseFront] = useState(null);
  const [driversLicenseBack, setDriversLicenseBack] = useState(null);
  const [optionalDocs, setOptionalDocs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const propertyId = new URLSearchParams(location.search).get("propertyId");

  useEffect(() => {
    const initialize = async () => {
      if (!propertyId) {
        navigate(createPageUrl("PublicPortal"));
        return;
      }
      try {
        const isDevelopment = import.meta.env.DEV;
        let userData = {};
        
        // Get user data only in production
        if (!isDevelopment) {
          userData = await User.me();
        } else {
          // Mock user data for development
          userData = {
            id: 'dev-user-123',
            full_name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567'
          };
        }
        
        const propData = await Property.get(propertyId);
        
        setUser(userData);
        setProperty(propData);
        setFormData({ 
          ...userData, 
          ...getInitialApplicationData(),
          property_id: propertyId,
          listed_rent: propData.monthly_rent
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Initialization failed:", error);
        navigate(createPageUrl("PublicPortal"));
      }
    };
    initialize();
  }, [propertyId, navigate]);
  
  const getInitialApplicationData = () => ({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    sin_last3: '',
    driver_license_number: '',
    driver_license_state: '',
    
    // Residential History
    current_address: '',
    current_monthly_rent: '',
    current_landlord_name: '',
    current_landlord_phone: '',
    reason_for_moving: '',
    
    // Employment & Income
    employment_status: '',
    employer_name: '',
    job_title: '',
    employment_length: '',
    monthly_income: '',
    other_income_source: '',
    other_income_amount: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Application Details
    desired_move_date: '',
    number_of_occupants: '1',
    co_applicants: [],
    lease_term: '12',
    budget_notes: '',
    
    // Pet Information
    has_pets: false,
    pets: [],
    
    // Consents
    consent_credit_check: false,
    agree_to_terms: false,
    agree_to_privacy: false,
  });

  const validateStep = (stepIndex) => {
    const newErrors = {};
    
    switch (stepIndex) {
      case 0: // Personal Information
        if (!formData.full_name?.trim()) newErrors.full_name = 'Full name is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
        if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
        if (!formData.sin_last3?.trim() || formData.sin_last3.length !== 3) {
          newErrors.sin_last3 = 'Last 3 digits of SIN required';
        }
        if (!formData.driver_license_number?.trim()) newErrors.driver_license_number = 'Driver license number is required';
        if (!formData.driver_license_state?.trim()) newErrors.driver_license_state = 'Driver license state is required';
        break;
        
      case 1: // Residential History
        if (!formData.current_address?.trim()) newErrors.current_address = 'Current address is required';
        if (!formData.current_monthly_rent) newErrors.current_monthly_rent = 'Current monthly rent is required';
        if (!formData.current_landlord_name?.trim()) newErrors.current_landlord_name = 'Current landlord name is required';
        if (!formData.current_landlord_phone?.trim()) newErrors.current_landlord_phone = 'Current landlord phone is required';
        break;
        
      case 2: // Employment & Income
        if (!formData.employment_status) newErrors.employment_status = 'Employment status is required';
        if (!formData.employer_name?.trim()) newErrors.employer_name = 'Employer name is required';
        if (!formData.job_title?.trim()) newErrors.job_title = 'Job title is required';
        if (!formData.employment_length?.trim()) newErrors.employment_length = 'Employment length is required';
        if (!formData.monthly_income) newErrors.monthly_income = 'Monthly income is required';
        if (!formData.emergency_contact_name?.trim()) newErrors.emergency_contact_name = 'Emergency contact name is required';
        if (!formData.emergency_contact_phone?.trim()) newErrors.emergency_contact_phone = 'Emergency contact phone is required';
        if (!formData.emergency_contact_relationship?.trim()) newErrors.emergency_contact_relationship = 'Emergency contact relationship is required';
        break;
        
      case 3: // Occupants & Lease Details
        if (!formData.desired_move_date) newErrors.desired_move_date = 'Desired move-in date is required';
        if (!formData.number_of_occupants || parseInt(formData.number_of_occupants) < 1) {
          newErrors.number_of_occupants = 'Number of occupants is required';
        }
        break;
        
      case 5: // Document Upload
        if (payStubs.length < 2) newErrors.pay_stubs = 'At least 2 pay stubs are required';
        if (!creditReport) newErrors.credit_report = 'Credit report is required';
        if (!driversLicenseFront) newErrors.dl_front = 'Driver license front is required';
        if (!driversLicenseBack) newErrors.dl_back = 'Driver license back is required';
        break;
        
      case 6: // Review & Submit
        if (!formData.consent_credit_check) newErrors.consent_credit_check = 'Credit check consent is required';
        if (!formData.agree_to_terms) newErrors.agree_to_terms = 'Agreement to terms is required';
        if (!formData.agree_to_privacy) newErrors.agree_to_privacy = 'Privacy agreement is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };
  
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const uploadFile = async (file) => {
    if (!file) return null;
    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      return result.file_url;
    } catch (error) {
      console.error("File upload failed:", error);
      alert("A file upload failed. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const uploadMultipleFiles = async (files) => {
    if (!files || files.length === 0) return [];
    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      return results.map(r => r.file_url);
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed. Please try again.");
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const addCoApplicant = () => {
    setFormData(prev => ({
      ...prev,
      co_applicants: [...prev.co_applicants, { name: "", relationship: "" }]
    }));
  };

  const removeCoApplicant = (index) => {
    setFormData(prev => ({
      ...prev,
      co_applicants: prev.co_applicants.filter((_, i) => i !== index)
    }));
  };

  const updateCoApplicant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      co_applicants: prev.co_applicants.map((app, i) => 
        i === index ? { ...app, [field]: value } : app
      )
    }));
  };

  const addPet = () => {
    setFormData(prev => ({
      ...prev,
      pets: [...prev.pets, { type: "", breed: "", size: "" }]
    }));
  };

  const removePet = (index) => {
    setFormData(prev => ({
      ...prev,
      pets: prev.pets.filter((_, i) => i !== index)
    }));
  };

  const updatePet = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      pets: prev.pets.map((pet, i) => 
        i === index ? { ...pet, [field]: value } : pet
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payStubUrls = await uploadMultipleFiles(payStubs);
      const creditReportUrl = await uploadFile(creditReport);
      const dlFrontUrl = await uploadFile(driversLicenseFront);
      const dlBackUrl = await uploadFile(driversLicenseBack);
      const optionalDocUrls = await uploadMultipleFiles(optionalDocs);

      if (payStubUrls.length < 2 || !creditReportUrl || !dlFrontUrl || !dlBackUrl) {
        throw new Error("Required document uploads failed. Please try again.");
      }

      // Update user profile data (only in production)
      const isDevelopment = import.meta.env.DEV;
      if (!isDevelopment) {
        const userProfileData = {
          date_of_birth: formData.date_of_birth,
          sin_last3: formData.sin_last3,
          driver_license_number: formData.driver_license_number,
          driver_license_state: formData.driver_license_state,
          current_address: formData.current_address,
          current_address_rent: parseFloat(formData.current_monthly_rent),
          current_landlord_name: formData.current_landlord_name,
          current_landlord_phone: formData.current_landlord_phone,
          reason_for_moving: formData.reason_for_moving,
          employment_status: formData.employment_status,
          employer_name: formData.employer_name,
          job_title: formData.job_title,
          monthly_income: parseFloat(formData.monthly_income),
          employment_length: formData.employment_length,
          other_income_source: formData.other_income_source,
          other_income_amount: parseFloat(formData.other_income_amount) || 0,
          pets: formData.has_pets,
          pet_details: formData.pets?.map(p => `${p.type} - ${p.breed}`).join(', ') || '',
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          emergency_contact_relationship: formData.emergency_contact_relationship,
        };
        await User.updateMyUserData(userProfileData);
      }

      // Create application
      const applicationPayload = {
        property_id: property.id,
        user_id: user.id,
        
        // Application Details
        desired_move_date: formData.desired_move_date,
        number_of_occupants: parseInt(formData.number_of_occupants),
        co_applicants: formData.co_applicants,
        lease_term: parseInt(formData.lease_term),
        budget_notes: formData.budget_notes,
        
        // Pet Information
        has_pets: formData.has_pets,
        pets: formData.pets,
        
        // Documents
        pay_stubs_urls: payStubUrls,
        credit_report_url: creditReportUrl,
        dl_front_url: dlFrontUrl,
        dl_back_url: dlBackUrl,
        optional_docs_urls: optionalDocUrls,
        
        // Consents
        consent_credit_check: formData.consent_credit_check,
        agree_to_terms: formData.agree_to_terms,
        agree_to_privacy: formData.agree_to_privacy,
        
        // Application scoring
        monthly_income_at_application: parseFloat(formData.monthly_income),
        employer_at_application: formData.employer_name,
        score: Math.min(10, Math.max(1, (parseFloat(formData.monthly_income) / property.monthly_rent) * 2.5)),
        docs_complete: 1,
        status: 'pending'
      };
      
      await RentalApplication.create(applicationPayload);
      navigate(createPageUrl("ApplicationSuccess"));

    } catch (error) {
      console.error("Submission failed:", error);
      alert(`An error occurred during submission: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }
  
  const FileUploadInput = ({ title, description, onFileChange, files, requiredCount, singleFile = false, required = false }) => {
    const fileCount = files ? (Array.isArray(files) ? files.length : 1) : 0;
    const isMet = requiredCount ? fileCount >= requiredCount : fileCount > 0;
    
    return (
      <div className="border border-slate-200 p-4 rounded-lg">
        <div className="flex justify-between items-start mb-3">
          <div>
            <RequiredLabel required={required}>{title}</RequiredLabel>
            <p className="text-sm text-secondary">{description}</p>
          </div>
          {isMet && <CheckCircle className="w-5 h-5 text-status-approved" />}
        </div>
        <div className="mt-4">
          <label className="flex items-center justify-center w-full px-4 py-6 bg-muted rounded-lg border-2 border-dashed border-border-muted cursor-pointer hover:bg-slate-200 transition-colors">
            <Upload className="w-5 h-5 mr-2 text-secondary" />
            <span className="text-sm text-primary">
              {isUploading ? 'Uploading...' : 'Click to upload files'}
            </span>
            <input 
              type="file" 
              className="hidden" 
              multiple={!singleFile} 
              onChange={onFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
        {files && files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-lg">
                <span className="truncate">{file.name}</span>
                <button 
                  type="button"
                  onClick={() => onFileChange({ remove: i })}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <X className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <RequiredLabel required>Full Name</RequiredLabel>
                <Input 
                  name="full_name" 
                  value={formData.full_name || ''} 
                  onChange={handleInputChange} 
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <RequiredLabel required>Email</RequiredLabel>
                <Input 
                  name="email" 
                  type="email"
                  value={formData.email || ''} 
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <RequiredLabel required>Phone</RequiredLabel>
                <Input 
                  name="phone" 
                  value={formData.phone || ''} 
                  onChange={handleInputChange}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <RequiredLabel required>Date of Birth</RequiredLabel>
                <Input 
                  name="date_of_birth" 
                  type="date"
                  value={formData.date_of_birth || ''} 
                  onChange={handleInputChange}
                  className={errors.date_of_birth ? 'border-red-500' : ''}
                />
                {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <RequiredLabel required>Last 3 Digits of SIN</RequiredLabel>
                <Input 
                  name="sin_last3" 
                  maxLength="3"
                  value={formData.sin_last3 || ''} 
                  onChange={handleInputChange}
                  className={errors.sin_last3 ? 'border-red-500' : ''}
                />
                {errors.sin_last3 && <p className="text-red-500 text-sm mt-1">{errors.sin_last3}</p>}
              </div>
              <div>
                <RequiredLabel required>Driver License Number</RequiredLabel>
                <Input 
                  name="driver_license_number" 
                  value={formData.driver_license_number || ''} 
                  onChange={handleInputChange}
                  className={errors.driver_license_number ? 'border-red-500' : ''}
                />
                {errors.driver_license_number && <p className="text-red-500 text-sm mt-1">{errors.driver_license_number}</p>}
              </div>
              <div>
                <RequiredLabel required>Issuing State</RequiredLabel>
                <Input 
                  name="driver_license_state" 
                  value={formData.driver_license_state || ''} 
                  onChange={handleInputChange}
                  className={errors.driver_license_state ? 'border-red-500' : ''}
                />
                {errors.driver_license_state && <p className="text-red-500 text-sm mt-1">{errors.driver_license_state}</p>}
              </div>
            </div>
          </div>
        );

      case 1: // Residential History
        return (
          <div className="space-y-6">
            <div>
              <RequiredLabel required>Current Address</RequiredLabel>
              <Textarea 
                name="current_address" 
                value={formData.current_address || ''} 
                onChange={handleInputChange}
                className={errors.current_address ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.current_address && <p className="text-red-500 text-sm mt-1">{errors.current_address}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <RequiredLabel required>Current Monthly Rent</RequiredLabel>
                <Input 
                  name="current_monthly_rent" 
                  type="number"
                  value={formData.current_monthly_rent || ''} 
                  onChange={handleInputChange}
                  className={errors.current_monthly_rent ? 'border-red-500' : ''}
                />
                {errors.current_monthly_rent && <p className="text-red-500 text-sm mt-1">{errors.current_monthly_rent}</p>}
              </div>
              <div>
                <RequiredLabel required>Current Landlord Name</RequiredLabel>
                <Input 
                  name="current_landlord_name" 
                  value={formData.current_landlord_name || ''} 
                  onChange={handleInputChange}
                  className={errors.current_landlord_name ? 'border-red-500' : ''}
                />
                {errors.current_landlord_name && <p className="text-red-500 text-sm mt-1">{errors.current_landlord_name}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <RequiredLabel required>Current Landlord Phone</RequiredLabel>
                <Input 
                  name="current_landlord_phone" 
                  value={formData.current_landlord_phone || ''} 
                  onChange={handleInputChange}
                  className={errors.current_landlord_phone ? 'border-red-500' : ''}
                />
                {errors.current_landlord_phone && <p className="text-red-500 text-sm mt-1">{errors.current_landlord_phone}</p>}
              </div>
              <div>
                <RequiredLabel>Reason for Moving</RequiredLabel>
                <Textarea 
                  name="reason_for_moving" 
                  value={formData.reason_for_moving || ''} 
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>
            </div>
          </div>
        );

      case 2: // Employment & Income
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <RequiredLabel required>Employment Status</RequiredLabel>
                <Select 
                  value={formData.employment_status || ''} 
                  onValueChange={(v) => handleSelectChange('employment_status', v)}
                >
                  <SelectTrigger className={errors.employment_status ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self_employed">Self-Employed</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employment_status && <p className="text-red-500 text-sm mt-1">{errors.employment_status}</p>}
              </div>
              <div>
                <RequiredLabel required>Employer Name</RequiredLabel>
                <Input 
                  name="employer_name" 
                  value={formData.employer_name || ''} 
                  onChange={handleInputChange}
                  className={errors.employer_name ? 'border-red-500' : ''}
                />
                {errors.employer_name && <p className="text-red-500 text-sm mt-1">{errors.employer_name}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <RequiredLabel required>Job Title</RequiredLabel>
                <Input 
                  name="job_title" 
                  value={formData.job_title || ''} 
                  onChange={handleInputChange}
                  className={errors.job_title ? 'border-red-500' : ''}
                />
                {errors.job_title && <p className="text-red-500 text-sm mt-1">{errors.job_title}</p>}
              </div>
              <div>
                <RequiredLabel required>Employment Length</RequiredLabel>
                <Input 
                  name="employment_length" 
                  value={formData.employment_length || ''} 
                  onChange={handleInputChange}
                  placeholder="e.g., 2 years 6 months"
                  className={errors.employment_length ? 'border-red-500' : ''}
                />
                {errors.employment_length && <p className="text-red-500 text-sm mt-1">{errors.employment_length}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <RequiredLabel required>Monthly Income (Before Tax)</RequiredLabel>
                <Input 
                  name="monthly_income" 
                  type="number"
                  value={formData.monthly_income || ''} 
                  onChange={handleInputChange}
                  className={errors.monthly_income ? 'border-red-500' : ''}
                />
                {errors.monthly_income && <p className="text-red-500 text-sm mt-1">{errors.monthly_income}</p>}
              </div>
              <div>
                <RequiredLabel>Other Income Amount</RequiredLabel>
                <Input 
                  name="other_income_amount" 
                  type="number"
                  value={formData.other_income_amount || ''} 
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <RequiredLabel>Other Income Source</RequiredLabel>
              <Input 
                name="other_income_source" 
                value={formData.other_income_source || ''} 
                onChange={handleInputChange}
                placeholder="e.g., freelancing, investments"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <RequiredLabel required>Name</RequiredLabel>
                  <Input 
                    name="emergency_contact_name" 
                    value={formData.emergency_contact_name || ''} 
                    onChange={handleInputChange}
                    className={errors.emergency_contact_name ? 'border-red-500' : ''}
                  />
                  {errors.emergency_contact_name && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_name}</p>}
                </div>
                <div>
                  <RequiredLabel required>Phone</RequiredLabel>
                  <Input 
                    name="emergency_contact_phone" 
                    value={formData.emergency_contact_phone || ''} 
                    onChange={handleInputChange}
                    className={errors.emergency_contact_phone ? 'border-red-500' : ''}
                  />
                  {errors.emergency_contact_phone && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_phone}</p>}
                </div>
                <div>
                  <RequiredLabel required>Relationship</RequiredLabel>
                  <Input 
                    name="emergency_contact_relationship" 
                    value={formData.emergency_contact_relationship || ''} 
                    onChange={handleInputChange}
                    className={errors.emergency_contact_relationship ? 'border-red-500' : ''}
                  />
                  {errors.emergency_contact_relationship && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_relationship}</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Occupants & Lease Details
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <RequiredLabel required>Desired Move-in Date</RequiredLabel>
                <Input 
                  name="desired_move_date" 
                  type="date"
                  value={formData.desired_move_date || ''} 
                  onChange={handleInputChange}
                  className={errors.desired_move_date ? 'border-red-500' : ''}
                />
                {errors.desired_move_date && <p className="text-red-500 text-sm mt-1">{errors.desired_move_date}</p>}
              </div>
              <div>
                <RequiredLabel required>Number of Occupants</RequiredLabel>
                <Input 
                  name="number_of_occupants" 
                  type="number"
                  min="1"
                  value={formData.number_of_occupants || ''} 
                  onChange={handleInputChange}
                  className={errors.number_of_occupants ? 'border-red-500' : ''}
                />
                {errors.number_of_occupants && <p className="text-red-500 text-sm mt-1">{errors.number_of_occupants}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <RequiredLabel>Lease Term</RequiredLabel>
                <Select 
                  value={formData.lease_term || '12'} 
                  onValueChange={(v) => handleSelectChange('lease_term', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <RequiredLabel>Property & Listed Rent</RequiredLabel>
                <Input 
                  value={`${property?.title} - $${property?.monthly_rent?.toLocaleString()}/mo`}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div>
              <RequiredLabel>Budget Range / Notes</RequiredLabel>
              <Textarea 
                name="budget_notes" 
                value={formData.budget_notes || ''} 
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional notes about budget or requirements..."
              />
            </div>

            {/* Co-Applicants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Co-Applicants</h3>
              <p className="text-sm text-gray-600 mb-4">Add names of any co-applicants who will be on the lease</p>
              
              {formData.co_applicants?.map((coApp, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Co-Applicant {index + 1}</h4>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      onClick={() => removeCoApplicant(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Full Name"
                      value={coApp.name}
                      onChange={(e) => updateCoApplicant(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Relationship"
                      value={coApp.relationship}
                      onChange={(e) => updateCoApplicant(index, 'relationship', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addCoApplicant}>
                <Plus className="w-4 h-4 mr-2" />
                Add Co-Applicant
              </Button>
            </div>
          </div>
        );

      case 4: // Pet Information
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="has_pets" 
                checked={formData.has_pets}
                onCheckedChange={(checked) => handleSelectChange('has_pets', checked)}
              />
              <RequiredLabel required>Do you have pets?</RequiredLabel>
            </div>

            {formData.has_pets && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Pet Details</h3>
                
                {formData.pets?.map((pet, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Pet {index + 1}</h4>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline" 
                        onClick={() => removePet(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Type (dog, cat, etc.)"
                        value={pet.type}
                        onChange={(e) => updatePet(index, 'type', e.target.value)}
                      />
                      <Input
                        placeholder="Breed"
                        value={pet.breed}
                        onChange={(e) => updatePet(index, 'breed', e.target.value)}
                      />
                      <Input
                        placeholder="Size (small, medium, large)"
                        value={pet.size}
                        onChange={(e) => updatePet(index, 'size', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                
                <Button type="button" variant="outline" onClick={addPet}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pet
                </Button>
              </div>
            )}
          </div>
        );

      case 5: // Document Upload
        return (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                All required documents must be uploaded before you can submit your application.
                Documents are stored securely and only accessible to authorized personnel.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
              <FileUploadInput
                title="Pay Stubs"
                description="Upload your last 2-3 pay stubs"
                files={payStubs}
                onFileChange={(e) => {
                  if (e.remove !== undefined) {
                    setPayStubs(stubs => stubs.filter((_, i) => i !== e.remove));
                  } else {
                    setPayStubs(stubs => [...stubs, ...e.target.files]);
                  }
                }}
                requiredCount={2}
                required
              />

              <FileUploadInput
                title="Credit Report"
                description="Upload a recent credit report (PDF or image)"
                singleFile
                files={creditReport ? [creditReport] : []}
                onFileChange={(e) => {
                  if (e.remove !== undefined) {
                    setCreditReport(null);
                  } else {
                    setCreditReport(e.target.files[0]);
                  }
                }}
                requiredCount={1}
                required
              />

              <FileUploadInput
                title="Driver's License (Front)"
                description="Clear photo of license front"
                singleFile
                files={driversLicenseFront ? [driversLicenseFront] : []}
                onFileChange={(e) => {
                  if (e.remove !== undefined) {
                    setDriversLicenseFront(null);
                  } else {
                    setDriversLicenseFront(e.target.files[0]);
                  }
                }}
                requiredCount={1}
                required
              />

              <FileUploadInput
                title="Driver's License (Back)"
                description="Clear photo of license back"
                singleFile
                files={driversLicenseBack ? [driversLicenseBack] : []}
                onFileChange={(e) => {
                  if (e.remove !== undefined) {
                    setDriversLicenseBack(null);
                  } else {
                    setDriversLicenseBack(e.target.files[0]);
                  }
                }}
                requiredCount={1}
                required
              />
            </div>

            <FileUploadInput
              title="Optional Supporting Documents"
              description="Employment letter, bank statements, landlord reference, pet documents (vaccine/insurance)"
              files={optionalDocs}
              onFileChange={(e) => {
                if (e.remove !== undefined) {
                  setOptionalDocs(docs => docs.filter((_, i) => i !== e.remove));
                } else {
                  setOptionalDocs(docs => [...docs, ...e.target.files]);
                }
              }}
            />

            {Object.keys(errors).length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please upload all required documents to continue.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 6: // Review & Submit
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review Your Application</h3>
            <p className="text-secondary">
              Please review all information and agree to the terms before submitting.
            </p>

            <div className="space-y-4 border-t pt-6">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="consent_credit_check" 
                  checked={formData.consent_credit_check}
                  onCheckedChange={(checked) => handleSelectChange('consent_credit_check', checked)}
                  className={errors.consent_credit_check ? 'border-red-500' : ''}
                />
                <div>
                  <RequiredLabel required>Consent to Credit & ID Checks</RequiredLabel>
                  <p className="text-sm text-secondary">
                    I authorize verification of this information and my credit history.
                  </p>
                  {errors.consent_credit_check && <p className="text-red-500 text-sm mt-1">{errors.consent_credit_check}</p>}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="agree_to_terms" 
                  checked={formData.agree_to_terms}
                  onCheckedChange={(checked) => handleSelectChange('agree_to_terms', checked)}
                  className={errors.agree_to_terms ? 'border-red-500' : ''}
                />
                <div>
                  <RequiredLabel required>Agree to Terms & Conditions</RequiredLabel>
                  <p className="text-sm text-secondary">
                    I have read and agree to the rental terms and conditions.
                  </p>
                  {errors.agree_to_terms && <p className="text-red-500 text-sm mt-1">{errors.agree_to_terms}</p>}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="agree_to_privacy" 
                  checked={formData.agree_to_privacy}
                  onCheckedChange={(checked) => handleSelectChange('agree_to_privacy', checked)}
                  className={errors.agree_to_privacy ? 'border-red-500' : ''}
                />
                <div>
                  <RequiredLabel required>Privacy Policy Agreement</RequiredLabel>
                  <p className="text-sm text-secondary">
                    I agree to the privacy policy and understand how my data will be used.
                  </p>
                  {errors.agree_to_privacy && <p className="text-red-500 text-sm mt-1">{errors.agree_to_privacy}</p>}
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                By submitting this application, you certify that all information provided is true and accurate.
                False information may result in rejection of your application.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return <div>Step {currentStep + 1}: Content not available</div>;
    }
  };

  return (
    <div className="min-h-screen bg-base p-4 md:p-8 flex flex-col items-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Rental Application</h1>
            {property && <p className="text-secondary">for {property.title}</p>}
          </div>
          <div className="pt-4">
            <Progress value={((currentStep + 1) / STEPS.length) * 100} />
            <p className="text-center text-sm text-secondary mt-2">
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="min-h-[500px] py-6">
              {renderStep()}
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 0}
              >
                Back
              </Button>
              
              {currentStep === STEPS.length - 1 ? (
                <Button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                  Submit Application
                </Button>
              ) : (
                <Button type="button" className="btn-primary" onClick={nextStep}>
                  Next
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}