import { Resend } from 'resend';
import type { Capsule } from '@shared/schema';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

async function getUncachableResendClient() {
  const credentials = await getCredentials();
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: credentials.fromEmail || 'noreply@flashback.app'
  };
}

export async function sendCapsuleEmail(
  recipientEmail: string,
  capsuleTitle: string,
  capsuleContent: string,
  createdAt: Date,
  capsule?: Capsule,
  reflection?: string
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const spotifySection = capsule?.spotifyTrackName ? `
      <div style="margin: 30px 0; padding: 20px; background-color: #1a1a1a; border: 1px solid #2d5f3c; border-radius: 8px;">
        <div style="color: #10b981; font-weight: 600; margin-bottom: 10px;">🎵 Soundtrack of the Moment</div>
        ${capsule.spotifyAlbumArt ? `<img src="${capsule.spotifyAlbumArt}" alt="Album Art" style="width: 100px; height: 100px; border-radius: 4px; margin: 10px 0;" />` : ''}
        <div style="color: #e8f5e9; font-weight: 600;">${capsule.spotifyTrackName}</div>
        <div style="color: #a5d6a7; font-size: 14px;">${capsule.spotifyArtist}</div>
        ${capsule.spotifyPreviewUrl ? `<div style="margin-top: 10px;"><a href="${capsule.spotifyPreviewUrl}" style="color: #10b981; text-decoration: none;">▶ Listen to Preview</a></div>` : ''}
      </div>
    ` : '';

    const locationSection = capsule?.locationName ? `
      <div style="margin: 30px 0; padding: 20px; background-color: #1a1a1a; border: 1px solid #2d5f3c; border-radius: 4px;">
        <div style="color: #10b981; font-weight: 600; margin-bottom: 10px;">📍 Location Memory</div>
        <div style="color: #e8f5e9;">${capsule.locationName}</div>
        ${capsule.latitude && capsule.longitude ? `<div style="color: #a5d6a7; font-size: 12px; margin-top: 5px;">${capsule.latitude}, ${capsule.longitude}</div>` : ''}
      </div>
    ` : '';

    const reflectionSection = reflection ? `
      <div style="margin: 30px 0; padding: 20px; background-color: #1a1a1a; border: 1px solid #2d5f3c; border-radius: 4px;">
        <div style="color: #10b981; font-weight: 600; margin-bottom: 10px;">💭 Reflection</div>
        <div style="color: #a5d6a7; font-style: italic; line-height: 1.6;">${reflection}</div>
      </div>
    ` : '';

    const selfDestructWarning = capsule?.selfDestruct ? `
      <div style="margin: 30px 0; padding: 15px; background-color: #3d1f1f; border: 1px solid #c62828; border-radius: 4px;">
        <div style="color: #ff6b6b; font-weight: 600; text-align: center;">⚠️ Self-Destruct Enabled</div>
        <div style="color: #ffb3b3; font-size: 12px; text-align: center; margin-top: 5px;">This capsule will be permanently deleted after viewing</div>
      </div>
    ` : '';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'JetBrains Mono', monospace;
              background-color: #0a0a0a;
              color: #e8f5e9;
              padding: 40px 20px;
              margin: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #141414;
              border: 1px solid #2d5f3c;
              border-radius: 8px;
              padding: 40px;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 1px solid #2d5f3c;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #10b981;
            }
            .title {
              font-size: 20px;
              font-weight: 600;
              color: #e8f5e9;
              margin: 20px 0;
            }
            .content {
              line-height: 1.8;
              color: #a5d6a7;
              margin: 30px 0;
              padding: 20px;
              background-color: #1a1a1a;
              border-left: 3px solid #10b981;
              border-radius: 4px;
            }
            .meta {
              font-size: 12px;
              color: #66bb6a;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #2d5f3c;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #2d5f3c;
              font-size: 12px;
              color: #66bb6a;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔒 FlashBack</div>
              <p style="color: #66bb6a; margin-top: 10px;">A message from the past has arrived</p>
            </div>
            
            ${selfDestructWarning}
            
            <div class="title">${capsuleTitle}</div>
            
            ${reflectionSection}
            
            <div class="content">
              ${capsuleContent.replace(/\n/g, '<br>')}
            </div>
            
            ${spotifySection}
            ${locationSection}
            
            <div class="meta">
              📅 Created on: ${createdAt.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}<br>
              🕒 Delivered on: ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            
            <div class="footer">
              This time capsule was encrypted and delivered by FlashBack<br>
              A message through time from your past self
            </div>
          </div>
        </body>
      </html>
    `;

    await client.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `🔒 Time Capsule Delivered: ${capsuleTitle}`,
      html: emailHtml,
    });

    console.log(`Email sent successfully to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
