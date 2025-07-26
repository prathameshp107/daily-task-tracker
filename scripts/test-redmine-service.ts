require('dotenv').config();
const { createRedmineService } = require('../src/lib/services/redmine.service');

// Configuration - update these values in your .env file or replace with actual values
const REDMINE_URL = process.env.REDMINE_URL || 'https://rm.virtuaresearch.com';
const REDMINE_API_KEY = process.env.REDMINE_API_KEY || '7a6856d66d8f22fb640f5e948aa1710b8be39c31';
const TEST_PROJECT_NAME = process.env.TEST_PROJECT_NAME || 'WAPT 3.0(2025)';

// Create a new Redmine service instance
const redmineService = createRedmineService(REDMINE_URL, REDMINE_API_KEY);


/**
 * Main test function
 */
async function testRedmineService() {
  console.log('🚀 Starting Redmine Service Tests');
  console.log('================================');
  console.log(`Redmine URL: ${REDMINE_URL}`);
  console.log(`Project Name: ${TEST_PROJECT_NAME}`);
  console.log('================================\n');

  try {
    console.log('🔍 Testing getIssuesWithUserInteraction...');
    const issues = await redmineService.getIssuesWithUserInteraction(TEST_PROJECT_NAME, 'prathamesh.pawar');
    
    if (!issues) {
      console.error(`❌ Project "${TEST_PROJECT_NAME}" not found`);
      return;
    }
    
    console.log(`✅ Found ${issues.length} issues with user interaction in project "${TEST_PROJECT_NAME}"`);
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the tests
testRedmineService();
