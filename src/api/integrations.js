import { base44 } from './base44Client';

const isDevelopment = import.meta.env.DEV;

// Mock integrations for development
const mockIntegrations = {
  Core: {
    UploadFile: async ({ file }) => {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a local object URL for the uploaded file
      const objectUrl = URL.createObjectURL(file);
      
      // Return the object URL which will work in development
      return {
        file_url: objectUrl,
        file_id: `file_${Date.now()}`,
        success: true
      };
    },
    SendEmail: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Mock email sent:', data);
      return { success: true, message_id: `msg_${Date.now()}` };
    },
    InvokeLLM: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { response: 'Mock LLM response', success: true };
    },
    GenerateImage: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { image_url: 'https://example.com/generated-image.jpg', success: true };
    },
    ExtractDataFromUploadedFile: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 1200));
      return { extracted_data: { mock: 'data' }, success: true };
    }
  }
};

export const Core = isDevelopment ? mockIntegrations.Core : base44.integrations.Core;

export const InvokeLLM = isDevelopment ? mockIntegrations.Core.InvokeLLM : base44.integrations.Core.InvokeLLM;

export const SendEmail = isDevelopment ? mockIntegrations.Core.SendEmail : base44.integrations.Core.SendEmail;

export const UploadFile = isDevelopment ? mockIntegrations.Core.UploadFile : base44.integrations.Core.UploadFile;

export const GenerateImage = isDevelopment ? mockIntegrations.Core.GenerateImage : base44.integrations.Core.GenerateImage;

export const ExtractDataFromUploadedFile = isDevelopment ? mockIntegrations.Core.ExtractDataFromUploadedFile : base44.integrations.Core.ExtractDataFromUploadedFile;






