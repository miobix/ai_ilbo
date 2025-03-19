import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    // Create credentials object from environment variables
    const credentials = JSON.parse(Buffer.from(process.env.NEXT_PUBLIC_GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('utf-8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
    const range = 'Prompt!B2:B3';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values;

    res.status(200).json(values);
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
} 