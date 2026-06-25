const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const extractPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

const extractDOCX = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
};

const extractText = async (filePath, fileType) => {
  if (fileType === 'pdf') {
    return await extractPDF(filePath);
  } else if (fileType === 'docx') {
    return await extractDOCX(filePath);
  }
  throw new Error(`Unsupported file type: ${fileType}`);
};

module.exports = { extractPDF, extractDOCX, extractText };
