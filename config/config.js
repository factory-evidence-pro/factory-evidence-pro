/**
 * Application Configuration
 * Timezone: Asia/Manila (UTC+8)
 */

export const CONFIG = {
    // Google Apps Script Web App URL
    GAS_URL: 'https://script.google.com/macros/s/AKfycbzzmPmhQOqkjbC6sFtYp66UNcr3jVv25pjZdJuWmq9ZyLrmS32vyCqzNCJU9ABxC3hCYg/exec',

    // Main Drive Folder ID
    MAIN_FOLDER_ID: '1T_ViuMgRMoS3Ny3ktjubyjjhAMfWgUPJ',

    // Timezone
    TIMEZONE: 'Asia/Manila',
    TIMEZONE_OFFSET: '+08:00',

    // File limits
    MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_VIDEOS: 1,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],

    // Excel columns
    EXCEL_COLUMNS: [
        'SKU',
        'Box Code',
        'Quantity',
        'FCL Date',
        'China Date',
        'Remarks',
        'Media Files',
        'Media Links',
        'Date Submitted (PH Time)'
    ],

    // Date format for display
    DATE_FORMAT: 'YYYY-MM-DD',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    TIMEZONE_DISPLAY: 'Asia/Manila (UTC+8)'
};