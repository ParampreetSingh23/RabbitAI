const ALLOWED_MIMETYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx'];

const fileValidator = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided.' });
  }

  const { mimetype, originalname } = req.file;
  const ext = originalname.toLowerCase().slice(originalname.lastIndexOf('.'));

  if (!ALLOWED_MIMETYPES.includes(mimetype) && !ALLOWED_EXTENSIONS.includes(ext)) {
    return res.status(400).json({
      error: 'Invalid file type. Only CSV and XLSX files are accepted.',
    });
  }

  next();
};

module.exports = fileValidator;
