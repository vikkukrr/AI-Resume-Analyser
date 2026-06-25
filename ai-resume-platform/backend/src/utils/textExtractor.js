const fs = require('fs');
const path = require('path');

/**
 * Extract plain text from PDF or DOCX file.
 * Uses pdf-parse for PDFs and mammoth for DOCX.
 */
const extractText = async (filePath, fileType) => {
  try {
    if (fileType === 'pdf') {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text || '';
    }

    if (fileType === 'docx') {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  } catch (err) {
    console.error('Text extraction error:', err.message);
    throw new Error(`Failed to extract text: ${err.message}`);
  }
};

module.exports = { extractText };
