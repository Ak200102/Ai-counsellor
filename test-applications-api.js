// Test script to verify applications API is working from frontend
import { getApplications } from './src/helpers/endpoints.js';

const testApplicationsAPI = async () => {
  try {
    console.log('🧪 Testing Applications API from Frontend...');
    
    // Check if token exists
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token found. Please log in first.');
      return;
    }
    
    // Test the API call
    console.log('📡 Calling getApplications()...');
    const response = await getApplications();
    
    console.log('✅ API Response received:');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('Data.data:', response.data.data);
    console.log('Data.data length:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('🎉 Applications found!');
      response.data.data.forEach((app, index) => {
        console.log(`  ${index + 1}. ${app.program} at ${app.university?.name || 'Unknown University'} (${app.status})`);
      });
    } else {
      console.log('❌ No applications found');
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
  }
};

// Auto-run test
testApplicationsAPI();
