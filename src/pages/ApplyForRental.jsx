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
import {
  FileUp,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
  Plus
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const STEPS = [
  "Personal Information",
  "Residential History", 
  "Employment & Income",
  "Additional Occupants",
  "Vehicles",
  "Pets",
  "Background & Declarations",
  "Document Upload",
  "Review & Submit",
];

export default function ApplyForRental() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [property, setProperty] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  
  const [payStubs, setPayStubs] = useState([]);
  const [creditReport, setCreditReport] = useState(null);
  const [driversLicenseFront, setDriversLicenseFront] = useState(null);
  const [driversLicenseBack, setDriversLicenseBack] = useState(null);
  const [petDocs, setPetDocs] = useState([]);
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
        const [userData, propData] = await Promise.all([
          User.me(),
          Property.get(propertyId)
        ]);
        setUser(userData);
        setProperty(propData);
        setFormData({ ...userData, ...getInitialApplicationData() });
        setIsLoading(false);
      } catch (error) {
        console.error("Initialization failed:", error);
        navigate(createPageUrl("PublicPortal"));
      }
    };
    initialize();
  }, [propertyId, navigate]);
  
  const getInitialApplicationData = () => ({
    co_applicants: [],
    other_occupants: [],
    vehicles: [],
    parking_required: false,
    parking_fee_accept: false,
    pets: [],
    pet_policy_ack: false,
    has_been_bankrupt: false,
    bankruptcy_details: "",
    has_been_evicted: false,
    eviction_details: "",
    has_committed_felony: false,
    felony_details: "",
    personal_references: [],
    additional_notes: "",
    desired_move_date: "",
    agrees_to_terms: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
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
  }

  const addOccupant = () => {
    setFormData(prev => ({
      ...prev,
      other_occupants: [...prev.other_occupants, { name: "", relationship: "", age: "" }]
    }));
  };

  const removeOccupant = (index) => {
    setFormData(prev => ({
      ...prev,
      other_occupants: prev.other_occupants.filter((_, i) => i !== index)
    }));
  };

  const updateOccupant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      other_occupants: prev.other_occupants.map((occ, i) => 
        i === index ? { ...occ, [field]: value } : occ
      )
    }));
  };

  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { make: "", model: "", year: "", color: "", license_plate: "" }]
    }));
  };

  const removeVehicle = (index) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index)
    }));
  };

  const updateVehicle = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((veh, i) => 
        i === index ? { ...veh, [field]: value } : veh
      )
    }));
  };

  const addPet = () => {
    setFormData(prev => ({
      ...prev,
      pets: [...prev.pets, { name: "", type: "", breed: "", age: "", weight: "", vaccinated: false }]
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

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      personal_references: [...prev.personal_references, { name: "", phone: "", relationship: "", years_known: "" }]
    }));
  };

  const removeReference = (index) => {
    setFormData(prev => ({
      ...prev,
      personal_references: prev.personal_references.filter((_, i) => i !== index)
    }));
  };

  const updateReference = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      personal_references: prev.personal_references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (payStubs.length < 3 || !creditReport || !driversLicenseFront || !driversLicenseBack) {
      alert("Please upload all required documents to continue.");
      return;
    }
    
    if (!formData.agrees_to_terms) {
        alert("You must agree to the terms to submit your application.");
        return;
    }

    // Validate required background fields
    if (formData.has_been_bankrupt === undefined || formData.has_been_evicted === undefined || formData.has_committed_felony === undefined) {
      alert("Please complete all required background questions.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payStubUrls = await uploadMultipleFiles(payStubs);
      const creditReportUrl = await uploadFile(creditReport);
      const dlFrontUrl = await uploadFile(driversLicenseFront);
      const dlBackUrl = await uploadFile(driversLicenseBack);
      const petDocUrls = await uploadMultipleFiles(petDocs);

      if (payStubUrls.length < 3 || !creditReportUrl || !dlFrontUrl || !dlBackUrl) {
          throw new Error("One or more required document uploads failed. Please try again.");
      }

      const userProfileData = {
        date_of_birth: formData.date_of_birth,
        ssn_last4: formData.ssn_last4,
        driver_license_number: formData.driver_license_number,
        driver_license_state: formData.driver_license_state,
        current_address: formData.current_address,
        current_address_rent: parseFloat(formData.current_address_rent),
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
        pets: formData.pets?.length > 0,
        pet_details: formData.pets?.map(p => `${p.name} (${p.type})`).join(', ') || '',
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
      };
      await User.updateMyUserData(userProfileData);

      const applicationPayload = {
        property_id: property.id,
        user_id: user.id,
        co_applicants: formData.co_applicants,
        other_occupants: formData.other_occupants,
        vehicles: formData.vehicles,
        parking_required: formData.parking_required,
        parking_fee_accept: formData.parking_fee_accept,
        pets: formData.pets,
        pet_docs_urls: petDocUrls,
        pet_policy_ack: formData.pet_policy_ack,
        has_been_bankrupt: formData.has_been_bankrupt,
        bankruptcy_details: formData.bankruptcy_details,
        has_been_evicted: formData.has_been_evicted,
        eviction_details: formData.eviction_details,
        has_committed_felony: formData.has_committed_felony,
        felony_details: formData.felony_details,
        personal_references: formData.personal_references,
        additional_notes: formData.additional_notes,
        desired_move_date: formData.desired_move_date,
        agrees_to_terms: formData.agrees_to_terms,
        pay_stubs_urls: payStubUrls,
        credit_report_url: creditReportUrl,
        dl_front_url: dlFrontUrl,
        dl_back_url: dlBackUrl,
        monthly_income_at_application: parseFloat(formData.monthly_income),
        employer_at_application: formData.employer_name,
        score: Math.min(10, Math.max(1, (parseFloat(formData.monthly_income) / property.monthly_rent) * 2.5)),
        docs_complete: 1
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
    return <div className="min-h-screen flex items-center justify-center bg-base"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  }
  
  const FileUploadInput = ({ title, description, onFileChange, files, requiredCount, singleFile = false }) => {
    const fileCount = files ? (Array.isArray(files) ? files.length : 1) : 0;
    const isMet = requiredCount ? fileCount >= requiredCount : fileCount > 0;
    
    return (
      <div className="border p-4 rounded-lg">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-semibold">{title}</h4>
                <p className="text-sm text-secondary">{description}</p>
            </div>
            {isMet && <CheckCircle className="w-5 h-5 text-status-approved" />}
        </div>
        <div className="mt-4">
            <label className="flex items-center justify-center w-full px-4 py-6 bg-muted rounded-lg border-2 border-dashed border-border-muted cursor-pointer hover:bg-slate-200">
                <FileUp className="w-5 h-5 mr-2 text-secondary" />
                <span className="text-sm text-primary">Click to upload</span>
                <input type="file" className="hidden" multiple={!singleFile} onChange={onFileChange} />
            </label>
        </div>
        {files && files.length > 0 && (
            <div className="mt-2 space-y-2">
                {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                        <span>{file.name}</span>
                        <button onClick={() => onFileChange({ remove: i })}>
                            <X className="w-4 h-4 text-red-500"/>
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
          <div className="space-y-4">
            <Input name="full_name" value={formData.full_name || ''} onChange={handleInputChange} placeholder="Full Name (required)" required />
            <Input name="email" value={formData.email || ''} type="email" placeholder="Email Address" disabled />
            <Input name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="Phone Number (required)" required />
            <Input name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleInputChange} type="date" placeholder="Date of Birth (required)" required />
            <Input name="ssn_last4" value={formData.ssn_last4 || ''} onChange={handleInputChange} placeholder="Last 4 Digits of SSN (required)" maxLength="4" required />
            <Input name="driver_license_number" value={formData.driver_license_number || ''} onChange={handleInputChange} placeholder="Driver's License Number" />
            <Input name="driver_license_state" value={formData.driver_license_state || ''} onChange={handleInputChange} placeholder="Driver's License State" />
            <Input name="emergency_contact_name" value={formData.emergency_contact_name || ''} onChange={handleInputChange} placeholder="Emergency Contact Name (required)" required />
            <Input name="emergency_contact_phone" value={formData.emergency_contact_phone || ''} onChange={handleInputChange} placeholder="Emergency Contact Phone (required)" required />
            <Input name="emergency_contact_relationship" value={formData.emergency_contact_relationship || ''} onChange={handleInputChange} placeholder="Emergency Contact Relationship (required)" required />
          </div>
        );
      case 1: // Residential History
        return (
          <div className="space-y-4">
            <Textarea name="current_address" value={formData.current_address || ''} onChange={handleInputChange} placeholder="Current Address (required)" required />
            <Input name="current_address_rent" value={formData.current_address_rent || ''} onChange={handleInputChange} type="number" placeholder="Current Rent Amount (required)" required />
            <Input name="current_landlord_name" value={formData.current_landlord_name || ''} onChange={handleInputChange} placeholder="Current Landlord Name (required)" required />
            <Input name="current_landlord_phone" value={formData.current_landlord_phone || ''} onChange={handleInputChange} placeholder="Current Landlord Phone (required)" required />
            <Textarea name="reason_for_moving" value={formData.reason_for_moving || ''} onChange={handleInputChange} placeholder="Reason for Moving (required)" required />
          </div>
        );
      case 2: // Employment & Income
        return (
          <div className="space-y-4">
            <Select name="employment_status" value={formData.employment_status || ''} onValueChange={(v) => handleSelectChange('employment_status', v)}>
                <SelectTrigger><SelectValue placeholder="Employment Status (required)" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self_employed">Self-Employed</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                </SelectContent>
            </Select>
            <Input name="employer_name" value={formData.employer_name || ''} onChange={handleInputChange} placeholder="Employer Name (required)" required />
            <Input name="job_title" value={formData.job_title || ''} onChange={handleInputChange} placeholder="Job Title (required)" required />
            <Input name="monthly_income" value={formData.monthly_income || ''} onChange={handleInputChange} type="number" placeholder="Gross Monthly Income (required)" required />
            <Input name="employment_length" value={formData.employment_length || ''} onChange={handleInputChange} placeholder="Length of Employment (required)" required />
            <Input name="other_income_source" value={formData.other_income_source || ''} onChange={handleInputChange} placeholder="Other Income Source" />
            <Input name="other_income_amount" value={formData.other_income_amount || ''} onChange={handleInputChange} type="number" placeholder="Other Income Amount" />
          </div>
        );
      case 3: // Additional Occupants
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-4">Additional Occupants</h4>
              <p className="text-sm text-secondary mb-4">List any additional people who will be living in the property (not including co-applicants).</p>
              
              {formData.other_occupants?.map((occupant, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Occupant {index + 1}</h5>
                    <Button type="button" size="sm" variant="outline" onClick={() => removeOccupant(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Full Name"
                      value={occupant.name}
                      onChange={(e) => updateOccupant(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Relationship"
                      value={occupant.relationship}
                      onChange={(e) => updateOccupant(index, 'relationship', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Age"
                      value={occupant.age}
                      onChange={(e) => updateOccupant(index, 'age', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addOccupant}>
                <Plus className="w-4 h-4 mr-2" />
                Add Occupant
              </Button>
            </div>
          </div>
        );
      case 4: // Vehicles
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-4">Vehicles</h4>
              <p className="text-sm text-secondary mb-4">List all vehicles that will be parked at the property.</p>
              
              {formData.vehicles?.map((vehicle, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Vehicle {index + 1}</h5>
                    <Button type="button" size="sm" variant="outline" onClick={() => removeVehicle(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Make"
                      value={vehicle.make}
                      onChange={(e) => updateVehicle(index, 'make', e.target.value)}
                    />
                    <Input
                      placeholder="Model"
                      value={vehicle.model}
                      onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Year"
                      value={vehicle.year}
                      onChange={(e) => updateVehicle(index, 'year', e.target.value)}
                    />
                    <Input
                      placeholder="Color"
                      value={vehicle.color}
                      onChange={(e) => updateVehicle(index, 'color', e.target.value)}
                    />
                    <Input
                      placeholder="License Plate"
                      value={vehicle.license_plate}
                      onChange={(e) => updateVehicle(index, 'license_plate', e.target.value)}
                      className="md:col-span-2"
                    />
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addVehicle}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
              
              <div className="border-t pt-4 mt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="parking_required" 
                    checked={formData.parking_required}
                    onCheckedChange={(checked) => handleSelectChange('parking_required', checked)}
                  />
                  <label htmlFor="parking_required" className="text-sm font-medium">
                    I require parking space(s)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="parking_fee_accept" 
                    checked={formData.parking_fee_accept}
                    onCheckedChange={(checked) => handleSelectChange('parking_fee_accept', checked)}
                  />
                  <label htmlFor="parking_fee_accept" className="text-sm font-medium">
                    I agree to pay additional parking fees if applicable
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 5: // Pets
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-4">Pets</h4>
              <p className="text-sm text-secondary mb-4">List all pets that will be living at the property.</p>
              
              {formData.pets?.map((pet, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Pet {index + 1}</h5>
                    <Button type="button" size="sm" variant="outline" onClick={() => removePet(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Pet Name"
                      value={pet.name}
                      onChange={(e) => updatePet(index, 'name', e.target.value)}
                    />
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
                      type="number"
                      placeholder="Age (years)"
                      value={pet.age}
                      onChange={(e) => updatePet(index, 'age', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Weight (lbs)"
                      value={pet.weight}
                      onChange={(e) => updatePet(index, 'weight', e.target.value)}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`vaccinated_${index}`}
                        checked={pet.vaccinated}
                        onCheckedChange={(checked) => updatePet(index, 'vaccinated', checked)}
                      />
                      <label htmlFor={`vaccinated_${index}`} className="text-sm">
                        Up to date on vaccinations
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addPet}>
                <Plus className="w-4 h-4 mr-2" />
                Add Pet
              </Button>
              
              {formData.pets?.length > 0 && (
                <div className="border-t pt-4 mt-6">
                  <FileUploadInput
                    title="Pet Documentation"
                    description="Upload vaccination records, photos, and any other pet-related documents."
                    files={petDocs}
                    onFileChange={(e) => {
                      if (e.remove !== undefined) {
                        setPetDocs(docs => docs.filter((_, i) => i !== e.remove));
                      } else {
                        setPetDocs(docs => [...docs, ...e.target.files]);
                      }
                    }}
                  />
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox 
                      id="pet_policy_ack" 
                      checked={formData.pet_policy_ack}
                      onCheckedChange={(checked) => handleSelectChange('pet_policy_ack', checked)}
                    />
                    <label htmlFor="pet_policy_ack" className="text-sm font-medium">
                      I acknowledge and agree to the property's pet policy and any associated fees
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 6: // Background & Declarations
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-4">Background & Declarations</h4>
              <p className="text-sm text-secondary mb-6">Please answer all questions truthfully. Background checks will be conducted.</p>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <label className="text-sm font-medium mb-3 block">Have you ever filed for bankruptcy? (required)</label>
                  <div className="flex gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="bankruptcy_yes"
                        name="has_been_bankrupt"
                        checked={formData.has_been_bankrupt === true}
                        onChange={() => handleSelectChange('has_been_bankrupt', true)}
                        required
                      />
                      <label htmlFor="bankruptcy_yes" className="text-sm">Yes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="bankruptcy_no"
                        name="has_been_bankrupt"
                        checked={formData.has_been_bankrupt === false}
                        onChange={() => handleSelectChange('has_been_bankrupt', false)}
                        required
                      />
                      <label htmlFor="bankruptcy_no" className="text-sm">No</label>
                    </div>
                  </div>
                  {formData.has_been_bankrupt && (
                    <Textarea
                      name="bankruptcy_details"
                      placeholder="Please provide details..."
                      value={formData.bankruptcy_details || ''}
                      onChange={handleInputChange}
                    />
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <label className="text-sm font-medium mb-3 block">Have you ever been evicted? (required)</label>
                  <div className="flex gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="evicted_yes"
                        name="has_been_evicted"
                        checked={formData.has_been_evicted === true}
                        onChange={() => handleSelectChange('has_been_evicted', true)}
                        required
                      />
                      <label htmlFor="evicted_yes" className="text-sm">Yes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="evicted_no"
                        name="has_been_evicted"
                        checked={formData.has_been_evicted === false}
                        onChange={() => handleSelectChange('has_been_evicted', false)}
                        required
                      />
                      <label htmlFor="evicted_no" className="text-sm">No</label>
                    </div>
                  </div>
                  {formData.has_been_evicted && (
                    <Textarea
                      name="eviction_details"
                      placeholder="Please provide details..."
                      value={formData.eviction_details || ''}
                      onChange={handleInputChange}
                    />
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <label className="text-sm font-medium mb-3 block">Have you ever been convicted of a felony? (required)</label>
                  <div className="flex gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="felony_yes"
                        name="has_committed_felony"
                        checked={formData.has_committed_felony === true}
                        onChange={() => handleSelectChange('has_committed_felony', true)}
                        required
                      />
                      <label htmlFor="felony_yes" className="text-sm">Yes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="felony_no"
                        name="has_committed_felony"
                        checked={formData.has_committed_felony === false}
                        onChange={() => handleSelectChange('has_committed_felony', false)}
                        required
                      />
                      <label htmlFor="felony_no" className="text-sm">No</label>
                    </div>
                  </div>
                  {formData.has_committed_felony && (
                    <Textarea
                      name="felony_details"
                      placeholder="Please provide details..."
                      value={formData.felony_details || ''}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
                
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-4">Personal References</h5>
                  <p className="text-sm text-secondary mb-4">Provide at least 2 personal references (not family members).</p>
                  
                  {formData.personal_references?.map((ref, index) => (
                    <div key={index} className="border rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center mb-3">
                        <h6 className="text-sm font-medium">Reference {index + 1}</h6>
                        <Button type="button" size="sm" variant="outline" onClick={() => removeReference(index)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Full Name"
                          value={ref.name}
                          onChange={(e) => updateReference(index, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Phone Number"
                          value={ref.phone}
                          onChange={(e) => updateReference(index, 'phone', e.target.value)}
                        />
                        <Input
                          placeholder="Relationship"
                          value={ref.relationship}
                          onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Years Known"
                          value={ref.years_known}
                          onChange={(e) => updateReference(index, 'years_known', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button type="button" variant="outline" onClick={addReference}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reference
                  </Button>
                </div>

                <div>
                  <Input
                    name="desired_move_date"
                    type="date"
                    value={formData.desired_move_date || ''}
                    onChange={handleInputChange}
                    placeholder="Desired Move-In Date (required)"
                    required
                  />
                </div>

                <div>
                  <Textarea
                    name="additional_notes"
                    placeholder="Additional notes or information you'd like to share..."
                    value={formData.additional_notes || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 7: // Document Upload
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600"/>
                    <p className="text-sm text-yellow-800">All documents are required to submit your application.</p>
                </div>
                <FileUploadInput
                    title="Pay Stubs (3 Required)"
                    description="Upload your last 3 consecutive pay stubs."
                    files={payStubs}
                    onFileChange={(e) => {
                        if (e.remove !== undefined) {
                            setPayStubs(stubs => stubs.filter((_, i) => i !== e.remove));
                        } else {
                            setPayStubs(stubs => [...stubs, ...e.target.files]);
                        }
                    }}
                    requiredCount={3}
                />
                <FileUploadInput
                    title="Credit Report (required)"
                    description="Upload a recent credit report (e.g., from Credit Karma, Equifax)."
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
                />
                <div className="grid md:grid-cols-2 gap-6">
                    <FileUploadInput
                        title="Driver's License (Front) - required"
                        description="A clear photo of the front."
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
                    />
                    <FileUploadInput
                        title="Driver's License (Back) - required"
                        description="A clear photo of the back."
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
                    />
                </div>
            </div>
        );
      case 8: // Review & Submit
        return (
          <div className="space-y-4">
             <h4 className="font-semibold text-lg">Review Your Information</h4>
             <p className="text-sm text-secondary">Please review all entered information and uploaded documents before submitting. You can go back to previous steps to make changes.</p>
             <div className="flex items-start space-x-2 pt-4 border-t">
                <Checkbox id="agrees_to_terms" checked={formData.agrees_to_terms} onCheckedChange={(c) => handleSelectChange('agrees_to_terms', c)} required />
                <label htmlFor="agrees_to_terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I certify that the information provided is true and correct, and I authorize verification of this information and my credit. (required)
                </label>
             </div>
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
            <p className="text-center text-sm text-secondary mt-2">{STEPS[currentStep]}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="min-h-[400px] py-6">
                {renderStep()}
            </div>
            <div className="flex justify-between items-center pt-6 border-t">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                Back
              </Button>
              {currentStep === STEPS.length - 1 ? (
                <Button type="submit" className="btn-primary" disabled={!formData.agrees_to_terms || isSubmitting}>
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