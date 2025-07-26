import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { url, apiKey, endpoint, params } = await request.json();

        if (!url || !apiKey || !endpoint) {
            return NextResponse.json(
                { error: 'Missing required parameters: url, apiKey, endpoint' },
                { status: 400 }
            );
        }

        // Construct the full URL
        const baseUrl = url.endsWith('/') ? url : `${url}/`;
        const fullUrl = new URL(endpoint, baseUrl);

        // Add query parameters
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) {
                    fullUrl.searchParams.append(key, value as string);
                }
            });
        }

        // Make the request to Redmine API
        const response = await fetch(fullUrl.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Redmine-API-Key': apiKey,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Redmine API error:', response.status, errorText);
            return NextResponse.json(
                {
                    error: `Redmine API error: ${response.status} ${response.statusText}`,
                    details: errorText
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error proxying Redmine request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed. Use POST.' },
        { status: 405 }
    );
}