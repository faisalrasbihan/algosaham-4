import { NextRequest, NextResponse } from 'next/server'

// Railway backend URL - configured via environment variable
// Prepend https:// if not already present
const rawUrl = process.env.RAILWAY_URL || ''
const RAILWAY_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

export async function POST(request: NextRequest) {
  console.log('🚀 [API ROUTE] Starting backtest API call...')
  console.log('🚀 [API ROUTE] Railway URL:', RAILWAY_URL)
  
  // Check if RAILWAY_URL is set
  if (!rawUrl) {
    console.error('❌ [API ROUTE] RAILWAY_URL environment variable not set')
    return NextResponse.json(
      { 
        error: 'Server configuration error',
        details: 'RAILWAY_URL environment variable is not configured. Please set it in your .env file.'
      }, 
      { status: 500 }
    )
  }
  
  console.log('✅ [API ROUTE] Using RAILWAY_URL:', RAILWAY_URL)
  
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
    
    console.log('🔄 [API ROUTE] Calling Railway endpoint:', `${RAILWAY_URL}/run_backtest`)
    console.log('📤 [API ROUTE] Sending to Railway:', JSON.stringify(fastApiRequest, null, 2))
    
    // Call Railway backend
    const response = await fetch(`${RAILWAY_URL}/run_backtest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fastApiRequest),
    })
    
    console.log('📡 [API ROUTE] Railway response status:', response.status)
    console.log('📡 [API ROUTE] Railway response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [API ROUTE] Railway error response:', errorText)
      console.error('❌ [API ROUTE] Request config that caused error:', JSON.stringify(fastApiRequest, null, 2))
      return NextResponse.json(
        { 
          error: `Railway error: ${response.status} ${response.statusText}`,
          details: errorText,
          hint: response.status === 500 
            ? 'Check Railway backend logs for detailed error. Common causes: date range has no data, no stocks match filters, or missing stock data.'
            : undefined,
          requestSent: fastApiRequest
        }, 
        { status: response.status }
      )
    }
    
    // Parse the response
    const result = await response.json()
    console.log('✅ [API ROUTE] Railway response received successfully')
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
// export async function OPTIONS() {
//   console.log('🔧 [API ROUTE] Handling CORS preflight request')
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type',
//     },
//   })
// }