// Mock integrations to replace base44 SDK
const mockIntegrations = {
  Core: {
    UploadFile: async ({ file }) => {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a local object URL for the uploaded file
      const objectUrl = URL.createObjectURL(file);
      
      // Return the object URL which will work in all environments
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

// Always use mock integrations to prevent base44 redirects
export const Core = mockIntegrations.Core;
export const InvokeLLM = mockIntegrations.Core.InvokeLLM;
export const SendEmail = mockIntegrations.Core.SendEmail;
export const UploadFile = mockIntegrations.Core.UploadFile;
export const GenerateImage = mockIntegrations.Core.GenerateImage;
export const ExtractDataFromUploadedFile = mockIntegrations.Core.ExtractDataFromUploadedFile;






