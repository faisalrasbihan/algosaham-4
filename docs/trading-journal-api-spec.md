# Trading Journal API Spec

## Overview
This document defines the API contract for the subscribed strategy trading journal shown in the portfolio page.

The endpoint returns the last `N` days of journal rows for a single subscribed strategy, already grouped by day and sorted from most recent to oldest.

## Endpoint
`GET /api/subscriptions/[subscriptionId]/trading-journal`

## Auth
Required.

The caller must be signed in and must own the `subscriptionId`.

## Query Parameters

### `days`
- Type: integer
- Required: no
- Default: `7`
- Min: `1`
- Max: `30`
- Description: Number of calendar days to return, including today.

### `timezone`
- Type: string
- Required: no
- Default: `Asia/Jakarta`
- Description: IANA timezone used for daily grouping.

## Success Response
Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "subscriptionId": 42,
    "strategy": {
      "id": 18,
      "name": "Momentum Quality Leaders",
      "description": "Focus on liquid leaders with improving momentum.",
      "creator": "AlgoSaham Research"
    },
    "range": {
      "days": 7,
      "timezone": "Asia/Jakarta",
      "from": "2026-02-25",
      "to": "2026-03-03"
    },
    "summary": {
      "totalEntries": 11,
      "totalValue": 147057200,
      "buyCount": 6,
      "sellCount": 5,
      "avgEntryPrice": 391550
    },
    "days": [
      {
        "date": "2026-03-03",
        "label": "Tuesday 3 Mar",
        "entryCount": 3,
        "totalValue": 103610440,
        "entries": [
          {
            "ticker": {
              "code": "BANK",
              "name": "Bank Aladin Syariah Tbk",
              "iconUrl": "/stock_icons/BANK.png"
            },
            "action": "BUY",
            "entryPrice": 391000,
            "value": 43537850
          },
          {
            "ticker": {
              "code": "BRPT",
              "name": "Barito Pacific Tbk",
              "iconUrl": "/stock_icons/BRPT.png"
            },
            "action": "SELL",
            "entryPrice": 220900,
            "value": 31776465
          },
          {
            "ticker": {
              "code": "CLEO",
              "name": "Sariguna Primatirta Tbk",
              "iconUrl": "/stock_icons/CLEO.png"
            },
            "action": "BUY",
            "entryPrice": 158300,
            "value": 28296125
          }
        ]
      },
      {
        "date": "2026-03-02",
        "label": "Monday 2 Mar",
        "entryCount": 1,
        "totalValue": 43446603,
        "entries": [
          {
            "ticker": {
              "code": "BANK",
              "name": "Bank Aladin Syariah Tbk",
              "iconUrl": "/stock_icons/BANK.png"
            },
            "action": "SELL",
            "entryPrice": 394700,
            "value": 43446603
          }
        ]
      }
    ]
  }
}
```

## Field Definitions

### Top-level
- `success`: boolean request status
- `data.subscriptionId`: subscribed strategy record ID
- `data.strategy`: lightweight strategy metadata for the journal header
- `data.range`: actual date range returned by the API
- `data.summary`: compact summary stats shown above the table
- `data.days`: grouped journal sections, newest first

### `summary`
- `totalEntries`: total row count across the requested range
- `totalValue`: sum of all entry values in the requested range
- `buyCount`: number of `BUY` entries
- `sellCount`: number of `SELL` entries
- `avgEntryPrice`: rounded average of all `entryPrice` values

### `days[]`
- `date`: ISO date in the requested timezone
- `label`: display label for the UI
- `entryCount`: number of rows for that day
- `totalValue`: day subtotal
- `entries`: flat list of journal rows for that day

### `entries[]`
- `ticker.code`: ticker code shown in the first column
- `ticker.name`: optional company name for future tooltip/detail use
- `ticker.iconUrl`: stock icon path or absolute URL
- `action`: `BUY` or `SELL`
- `entryPrice`: execution or signal entry price
- `value`: monetary value for that journal row

## Sorting and Grouping Rules
- Days must be sorted descending by date.
- Entries inside each day should be sorted descending by execution timestamp if available.
- Grouping must be done in the requested `timezone`.
- Empty days should be omitted from `days`.

## Error Responses

### `401 Unauthorized`
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### `403 Forbidden`
```json
{
  "success": false,
  "error": "Forbidden"
}
```

### `404 Not Found`
```json
{
  "success": false,
  "error": "Subscription not found"
}
```

### `400 Bad Request`
```json
{
  "success": false,
  "error": "Invalid days parameter"
}
```

## Implementation Notes
- Reuse the existing Clerk session auth pattern used by other subscription endpoints.
- Validate that `subscriptions.userId === auth().userId` before returning any journal data.
- If the underlying trade model stores timestamps, compute day buckets server-side rather than in the client.
- Keep the response UI-oriented: the portfolio dialog should not need to regroup rows client-side.

## Suggested Route File
`app/api/subscriptions/[subscriptionId]/trading-journal/route.ts`

## Suggested Future Extensions
- Add `executedAt` per row if the UI later needs intraday ordering.
- Add `quantity` if the journal expands beyond the compact portfolio view.
- Add `pnl` only if the portfolio journal explicitly needs realized performance, to avoid overloading the table.
