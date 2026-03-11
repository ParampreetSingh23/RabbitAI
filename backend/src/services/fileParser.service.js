const Papa = require('papaparse');
const XLSX = require('xlsx');

/**
 * Parse an uploaded file (CSV or XLSX) into an array of row objects.
 * @param {Express.Multer.File} file
 * @returns {Promise<Object[]>}
 */
const parseFile = async (file) => {
  const { mimetype, buffer, originalname } = file;

  // CSV
  if (
    mimetype === 'text/csv' ||
    originalname.toLowerCase().endsWith('.csv')
  ) {
    const content = buffer.toString('utf-8');
    const result = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (result.errors && result.errors.length > 0) {
      const criticalErrors = result.errors.filter((e) => e.type === 'Delimiter');
      if (criticalErrors.length > 0) {
        throw new Error(`CSV parse error: ${criticalErrors[0].message}`);
      }
    }

    return result.data;
  }

  // XLSX
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    originalname.toLowerCase().endsWith('.xlsx')
  ) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    return rows;
  }

  throw new Error('Unsupported file format. Only CSV and XLSX are accepted.');
};

module.exports = { parseFile };
