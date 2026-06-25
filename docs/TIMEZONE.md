# Timezone Configuration - Philippines (UTC+8)

## Overview
The system is configured to use **Asia/Manila timezone (UTC+8)** for all operations.

## Implementation Details

### Backend (Google Apps Script)
- `timeZone: "Asia/Manila"` in appsscript.json
- All date operations use PH timezone
- `getPhilippinesTime()` function returns current PH time
- Excel timestamps are in PH time

### Frontend
- Dates default to PH timezone
- PH time display in header updates every minute
- All submissions timestamped with PH time

## Folder Structure with PH Time