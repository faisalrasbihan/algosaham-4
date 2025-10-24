import { NextRequest, NextResponse } from 'next/server'

// FastAPI backend URL - can be configured via environment variable
const FASTAPI_URL = process.env.FASTAPI_URL //|| 'https://backtester-psi.vercel.app'

export async function POST(request: NextRequest) {
  console.log('🚀 [API ROUTE] Starting backtest API call...')
  console.log('🚀 [API ROUTE] FastAPI URL:', FASTAPI_URL)
  
  // Log environment variable status
  if (!process.env.FASTAPI_URL) {
    console.warn('⚠️ [API ROUTE] FASTAPI_URL environment variable not set, using fallback URL')
  } else {
    console.log('✅ [API ROUTE] Using FASTAPI_URL from environment variable')
  }
  
  try {
    // Parse the request body
    const body = await request.json()
    console.log('📦 [API ROUTE] Request body received:', JSON.stringify(body, null, 2))
    
    // Validate request structure
    if (!body.config) {
      console.error('❌ [API ROUTE] Missing config in request body')
      return NextResponse.json({ error: 'Missing config in request body' }, { status: 400 })
    }
    
    console.log('📋 [API ROUTE] Config structure:', {
      backtestId: body.config.backtestId,
      filters: body.config.filters,
      fundamentalIndicators: body.config.fundamentalIndicators?.length || 0,
      technicalIndicators: body.config.technicalIndicators?.length || 0,
      backtestConfig: body.config.backtestConfig
    })
    
    // Prepare the request to FastAPI
    const fastApiRequest = {
      config: body.config
    }
    
    console.log('🔄 [API ROUTE] Calling FastAPI endpoint:', `${FASTAPI_URL}/run_backtest`)
    console.log('📤 [API ROUTE] Sending to FastAPI:', JSON.stringify(fastApiRequest, null, 2))
    
    // Call FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/run_backtest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fastApiRequest),
    })
    
    console.log('📡 [API ROUTE] FastAPI response status:', response.status)
    console.log('📡 [API ROUTE] FastAPI response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [API ROUTE] FastAPI error response:', errorText)
      return NextResponse.json(
        { 
          error: `FastAPI error: ${response.status} ${response.statusText}`,
          details: errorText 
        }, 
        { status: response.status }
      )
    }
    
    // Parse the response
    const result = await response.json()
    console.log('✅ [API ROUTE] FastAPI response received successfully')
    console.log('📊 [API ROUTE] Response data keys:', Object.keys(result))
    console.log('📈 [API ROUTE] Response sample:', JSON.stringify(result, null, 2).substring(0, 500) + '...')
    
    // Log specific performance metrics if available
    if (result.totalReturn !== undefined) {
      console.log('📈 [API ROUTE] Total Return:', result.totalReturn)
    }
    if (result.annualReturn !== undefined) {
      console.log('📈 [API ROUTE] Annual Return:', result.annualReturn)
    }
    if (result.trades && Array.isArray(result.trades)) {
      console.log('📈 [API ROUTE] Number of trades:', result.trades.length)
    }
    if (result.performanceData && Array.isArray(result.performanceData)) {
      console.log('📈 [API ROUTE] Performance data points:', result.performanceData.length)
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('💥 [API ROUTE] Unexpected error:', error)
    console.error('💥 [API ROUTE] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  console.log('🔧 [API ROUTE] Handling CORS preflight request')
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}