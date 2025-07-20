import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import axios from 'axios';

type IntegrationType = 'jira' | 'redmine';

interface IntegrationConfig {
  host: string;
  username?: string;
  apiToken?: string;
  apiKey?: string;
}

export async function POST(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  const { type, config } = await req.json();
  
  // Validate request
  if (!type || !config || !['jira', 'redmine'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid integration type. Must be "jira" or "redmine"' },
      { status: 400 }
    );
  }

  try {
    let success = false;
    let error = '';
    
    if (type === 'jira') {
      success = await testJiraConnection(config);
      if (!success) {
        error = 'Failed to connect to JIRA. Please check your credentials and host URL.';
      }
    } else if (type === 'redmine') {
      success = await testRedmineConnection(config);
      if (!success) {
        error = 'Failed to connect to Redmine. Please check your API key and host URL.';
      }
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Successfully connected to ${type.toUpperCase()}`
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: error || `Failed to connect to ${type.toUpperCase()}`
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(`Error testing ${type} connection:`, error);
    return NextResponse.json(
      { 
        success: false,
        error: `Error testing ${type.toUpperCase()} connection: ${error.message}`
      },
      { status: 500 }
    );
  }
}

async function testJiraConnection(config: IntegrationConfig): Promise<boolean> {
  const { host, username, apiToken } = config;
  
  if (!host || !username || !apiToken) {
    throw new Error('Missing required JIRA configuration (host, username, or apiToken)');
  }

  try {
    // Test connection by fetching current user
    const response = await axios.get(`${host}/rest/api/3/myself`, {
      auth: {
        username,
        password: apiToken
      },
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 seconds timeout
    });

    return response.status === 200 && response.data.accountId !== undefined;
  } catch (error) {
    console.error('JIRA connection test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testRedmineConnection(config: IntegrationConfig): Promise<boolean> {
  const { host, apiKey } = config;
  
  if (!host || !apiKey) {
    throw new Error('Missing required Redmine configuration (host or apiKey)');
  }

  try {
    // Test connection by fetching current user
    const response = await axios.get(`${host}/users/current.json`, {
      headers: {
        'X-Redmine-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds timeout
    });

    return response.status === 200 && response.data.user !== undefined;
  } catch (error) {
    console.error('Redmine connection test failed:', error.response?.data || error.message);
    return false;
  }
}
