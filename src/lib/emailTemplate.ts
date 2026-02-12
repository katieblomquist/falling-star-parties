import { characters, dresses, extras, packages } from "@/app/mockdata";

type CharacterSelection = { characterId: number; dressId: number };

interface FormSubmissionData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateTime: string;
  address: string;
  packageId: number;
  characterSelections: CharacterSelection[];
  extrasIds: number[];
  eventType: string;
  childName?: string | null;
  childAge?: number | null;
  orgName?: string | null;
  numChildren: number;
  locationPref: string;
  photoPref: boolean;
  additionalInfo?: string | null;
}

const characterNameMap: Record<string, string> = {
  "Ice Queen": "Elsa",
  "Snow Princess": "Anna",
  "Mermaid Princess": "Ariel",
  "Rose Princess": "Belle",
  "Glass Slipper Princess": "Cinderella",
  "Tower Princess": "Rapunzel",
  "Sleeping Princess": "Aurora",
  "Bubble Queen": "Glinda",
};

const packageNameMap: Record<string, string> = {
  "Dream": "Dream - 30 Min",
  "Sparkle": "Sparkle - 60 Min",
  "Shine": "Shine - 90 Min",
  "One Hour Meet and Greet": "Meet and Greet - 60 Min",
  "Two Hour Meet and Greet": "Meet and Greet - 120 Min",
};

export function generateEmailTemplate(data: FormSubmissionData): { html: string; subject: string } {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const formattedDate = new Date(data.dateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const packageName = packages.find(p => p.id === data.packageId)?.title || "Unknown Package";
  const mappedPackageName = packageNameMap[packageName] || packageName;

  const characterNames = data.characterSelections.map(selection => {
    const character = characters.find(c => c.id === selection.characterId);
    return character ? (characterNameMap[character.name] || character.name) : 'Unknown Character';
  });

  const dressNames = data.characterSelections.map(selection => {
    const dress = dresses.find(d => d.id === selection.dressId);
    const character = characters.find(c => c.id === selection.characterId);
    
    if (!dress || !character) return null;
    
    const dressName = dress.name;
    const characterName = characterNameMap[character.name] || character.name;
    
    if (dressName === "Adventure Dress" || dressName === "Ballgown" || dressName === "Holiday Dress") {
      return `${dressName} (${characterName})`;
    }
    
    return dressName;
  }).filter(Boolean);

  const extrasNames = data.extrasIds.map(id => {
    const extra = extras.find(e => e.id === id);
    return extra?.title || 'Unknown Extra';
  });

  const subject = `New Event Request - ${fullName} - ${data.eventType}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Party Request</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .header {
          background: linear-gradient(135deg, #343B95 0%, #4a52a8 100%);
          color: white;
          padding: 30px 20px;
          border-radius: 15px 15px 0 0;
          text-align: center;
          margin-bottom: 0;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 0 0 15px 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .section {
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
        }
        .section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .section h2 {
          color: #343B95;
          font-size: 18px;
          margin-bottom: 15px;
          font-weight: 600;
          border-left: 4px solid #343B95;
          padding-left: 15px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }
        .info-item {
          background: #f8f9fa;
          padding: 12px 15px;
          border-radius: 8px;
          border-left: 3px solid #343B95;
        }
        .info-label {
          font-weight: 600;
          color: #343B95;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .info-value {
          color: #333;
          font-size: 15px;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        .character-list, .extras-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        .character-item, .extra-item {
          background: #e7f3ff;
          color: #0066cc;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid #b3d9ff;
        }
        .highlight {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .highlight strong {
          color: #856404;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e9ecef;
          color: #6c757d;
          font-size: 14px;
        }
        .logo {
          font-style: italic;
          font-size: 24px;
          color: #343B95;
          margin-bottom: 10px;
        }
        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          body {
            padding: 10px;
          }
          .header, .content {
            padding: 20px 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">✨ Falling Star Parties</div>
        <h1>New Event Request!</h1>
        <p>A magical new party request has arrived</p>
      </div>
      
      <div class="content">
        <div class="section">
          <h2>👤 Client Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Name</div>
              <div class="info-value">${fullName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${data.email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone</div>
              <div class="info-value">${data.phone}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Event Type</div>
              <div class="info-value">${data.eventType}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>📅 Event Details</h2>
          <div class="info-grid">
            <div class="info-item full-width">
              <div class="info-label">Date & Time</div>
              <div class="info-value">${formattedDate}</div>
            </div>
            <div class="info-item full-width">
              <div class="info-label">Location</div>
              <div class="info-value">${data.address}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Package</div>
              <div class="info-value">${mappedPackageName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Number of Children</div>
              <div class="info-value">${data.numChildren}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Location Preference</div>
              <div class="info-value">${data.locationPref}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Photos Allowed</div>
              <div class="info-value">${data.photoPref ? 'Yes ✅' : 'No ❌'}</div>
            </div>
          </div>
        </div>

        ${data.childName || data.childAge || data.orgName ? `
        <div class="section">
          <h2>👶 Additional Details</h2>
          <div class="info-grid">
            ${data.childName ? `
            <div class="info-item">
              <div class="info-label">Child's Name</div>
              <div class="info-value">${data.childName}</div>
            </div>
            ` : ''}
            ${data.childAge ? `
            <div class="info-item">
              <div class="info-label">Child's Age</div>
              <div class="info-value">${data.childAge} years old</div>
            </div>
            ` : ''}
            ${data.orgName ? `
            <div class="info-item full-width">
              <div class="info-label">Organization</div>
              <div class="info-value">${data.orgName}</div>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        ${characterNames.length > 0 ? `
        <div class="section">
          <h2>👸 Character Selections</h2>
          <div class="character-list">
            ${characterNames.map(name => `<div class="character-item">${name}</div>`).join('')}
          </div>
          ${dressNames.length > 0 ? `
            <div style="margin-top: 15px;">
              <div class="info-label">Dress Selections:</div>
              <div class="character-list">
                ${dressNames.map(dress => `<div class="character-item" style="background: #fce4ec; color: #c2185b; border-color: #f8bbd9;">${dress}</div>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        ` : ''}

        ${extrasNames.length > 0 ? `
        <div class="section">
          <h2>✨ Add-on Services</h2>
          <div class="extras-list">
            ${extrasNames.map(extra => `<div class="extra-item">${extra}</div>`).join('')}
          </div>
        </div>
        ` : ''}

        ${data.additionalInfo ? `
        <div class="section">
          <h2>💬 Additional Comments</h2>
          <div class="highlight">
            <strong>Client Notes:</strong><br>
            ${data.additionalInfo.replace(/\n/g, '<br>')}
          </div>
        </div>
        ` : ''}
      </div>

      <div class="footer">
        <div class="logo">Falling Star Parties</div>
        <p>Make every celebration magical! ✨</p>
        <p style="font-size: 12px; margin-top: 10px;">
          This email was automatically generated from your website booking form.
        </p>
      </div>
    </body>
    </html>
  `;

  return { html, subject };
}