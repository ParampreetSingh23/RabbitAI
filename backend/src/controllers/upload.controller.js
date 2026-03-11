const fileParserService = require('../services/fileParser.service');
const geminiService = require('../services/gemini.service');
const mailerService = require('../services/mailer.service');

const handleUpload = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // 1. Parse uploaded file
    const rows = await fileParserService.parseFile(req.file);

    if (!rows || rows.length === 0) {
      return res.status(422).json({ error: 'Uploaded file contains no data rows.' });
    }

    // 2. Generate AI summary via Gemini
    const summary = await geminiService.generateSummary(rows);

    // 3. Send email with summary
    await mailerService.sendSummaryEmail(email, summary);

    // 4. Return response
    return res.status(200).json({
      message: 'Analysis complete. Summary sent to your email.',
      summary,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { handleUpload };
