/**
 * Factory Evidence Pro - Google Apps Script Backend
 * Timezone: Asia/Manila (UTC+8)
 */

const MAIN_FOLDER_ID = '1T_ViuMgRMoS3Ny3ktjubyjjhAMfWgUPJ';
const EXCEL_FILENAME = 'Evidence_Report.xlsx';
const TIMEZONE = 'Asia/Manila';

/**
 * Handle POST requests from frontend
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.parameters.data);
    const files = e.parameters.media || [];

    const result = saveEvidenceData(data, files);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main function to save evidence data
 */
function saveEvidenceData(data, files) {
  try {
    // Parse dates using PH timezone
    const fclDate = new Date(data.fclDate + 'T00:00:00+08:00');
    const chinaDate = new Date(data.chinaDate + 'T00:00:00+08:00');

    if (isNaN(fclDate.getTime()) || isNaN(chinaDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // Get PH timezone info for folder creation
    const phTime = getPhilippinesTime();

    // Get or create folder structure
    const boxFolder = getOrCreateBoxFolder(
      data.boxCode,
      fclDate.getFullYear(),
      fclDate.getMonth()
    );

    // Create subfolders
    const imagesFolder = getOrCreateSubFolder(boxFolder, 'Images');
    const videosFolder = getOrCreateSubFolder(boxFolder, 'Videos');

    // Save media files
    const savedFiles = [];
    let imageIndex = 1;
    let videoSaved = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const blob = Utilities.newBlob(
        Utilities.base64Decode(file.bytes),
        file.mimeType,
        file.filename
      );

      let savedFile;
      if (file.mimeType.startsWith('image/')) {
        const filename = `SKU_${data.sku}_${String(imageIndex).padStart(2, '0')}.jpg`;
        savedFile = imagesFolder.createFile(blob.setName(filename));
        savedFiles.push({
          type: 'image',
          name: filename,
          url: savedFile.getUrl(),
          id: savedFile.getId()
        });
        imageIndex++;
      } else if (file.mimeType.startsWith('video/') && !videoSaved) {
        const filename = `SKU_${data.sku}_video.mp4`;
        savedFile = videosFolder.createFile(blob.setName(filename));
        savedFiles.push({
          type: 'video',
          name: filename,
          url: savedFile.getUrl(),
          id: savedFile.getId()
        });
        videoSaved = true;
      }
    }

    // Update Excel with PH timezone
    const excelFile = updateExcel(boxFolder, data, savedFiles);

    return {
      success: true,
      folderUrl: boxFolder.getUrl(),
      excelUrl: excelFile.getUrl(),
      mediaCount: savedFiles.length,
      videoCount: videoSaved ? 1 : 0,
      timestamp: getPhilippinesTime().toISOString(),
      message: 'Evidence saved successfully! (PH Time)'
    };

  } catch (error) {
    throw new Error(`Failed to save evidence: ${error.toString()}`);
  }
}

/**
 * Get current Philippines time
 */
function getPhilippinesTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
}

/**
 * Get or create box folder: Year/Month/BoxCode_Date
 */
function getOrCreateBoxFolder(boxCode, year, month) {
  // Get or create year folder
  const yearFolder = getOrCreateFolder(
    year.toString(),
    MAIN_FOLDER_ID
  );

  // Get or create month folder
  const monthName = getMonthName(month);
  const monthFolder = getOrCreateFolder(
    monthName,
    yearFolder.getId()
  );

  // Get or create box folder with PH date
  const phTime = getPhilippinesTime();
  const dateStr = formatDateForFolder(new Date(year, month, phTime.getDate()));
  const boxFolderName = `${boxCode}_${dateStr}`;

  return getOrCreateFolder(boxFolderName, monthFolder.getId());
}

/**
 * Get or create a folder
 */
function getOrCreateFolder(folderName, parentId) {
  const parent = DriveApp.getFolderById(parentId);
  const folders = parent.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parent.createFolder(folderName);
  }
}

/**
 * Get or create subfolder within a parent folder
 */
function getOrCreateSubFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

/**
 * Update Excel file with new evidence entry
 */
function updateExcel(boxFolder, data, savedFiles) {
  // Get or create Excel file
  let excelFile;
  const files = boxFolder.getFilesByName(EXCEL_FILENAME);

  if (files.hasNext()) {
    excelFile = files.next();
  } else {
    // Create new Excel file with BOM for UTF-8
    const header = '\uFEFFSKU,Box Code,Quantity,FCL Date,China Date,Remarks,Media Files,Media Links,Date Submitted (PH Time)\n';
    const blob = Utilities.newBlob(header, 'text/csv', EXCEL_FILENAME);
    excelFile = boxFolder.createFile(blob);
  }

  // Read existing content
  const content = excelFile.getBlob().getDataAsString();
  const lines = content.split('\n');

  // Prepare new row
  const mediaNames = savedFiles.map(f => f.name).join(', ');
  const mediaLinks = savedFiles.map(f =>
    `=HYPERLINK("${f.url}", "${f.type === 'image' ? 'View Image' : 'View Video'}")`
  ).join(', ');

  // Get PH timestamp
  const phTime = getPhilippinesTime();
  const timestamp = Utilities.formatDate(phTime, TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

  const newRow = [
    data.sku,
    data.boxCode,
    data.quantity,
    data.fclDate,
    data.chinaDate,
    data.remarks || '',
    mediaNames,
    mediaLinks,
    timestamp
  ].join(',');

  // Append new row
  lines.push(newRow);
  const newContent = lines.join('\n');

  // Update file with BOM
  excelFile.setContent('\uFEFF' + newContent);

  return excelFile;
}

/**
 * Helper: Get month name
 */
function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

/**
 * Helper: Format date for folder name (PH format)
 */
function formatDateForFolder(date) {
  const month = getMonthName(date.getMonth());
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}_${day}_${year}`;
}

/**
 * Helper: Get current script URL for CORS
 */
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}