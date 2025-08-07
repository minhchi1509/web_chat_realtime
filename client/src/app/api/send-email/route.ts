import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, to, subject, message } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is missing' },
        { status: 400 }
      );
    }

    // Tạo OAuth2Client từ googleapis (không cần import google-auth-library)
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const encodedMessage = Buffer.from(
      `To: ${to}\r\n` + `Subject: ${subject}\r\n\r\n` + `${message}`
    )
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
