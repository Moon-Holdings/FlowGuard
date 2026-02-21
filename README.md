# FlowGuard Outlook Add-in

FlowGuard is an enterprise-grade Outlook add-in designed for IT sales teams to manage quotes, prevent missed replies, and track their sales pipeline directly within Outlook.

## Features
- **Inbox Triage**: Automated prioritization based on keywords (quote, RFQ) and VIP status.
- **Pipeline Kanban**: Drag-and-drop deal tracking.
- **Pre-Send Safeguards**: Attachment checks and price validation before sending.
- **Escalations**: Automated draft creation for overdue responses.
- **RTL Support**: Full support for Hebrew/English.

## Sideloading Instructions

### 1. Development Setup
1. Install dependencies: `npm install`
2. Start the server: `npm run dev`
   - The app runs on `http://localhost:3000` (or your assigned APP_URL).

### 2. Sideload in Outlook Web
1. Go to [Outlook Web](https://outlook.office.com).
2. Open any email.
3. Click the "More actions" (...) button on the email.
4. Select **Get Add-ins** or **Apps** > **Add apps**.
5. Click **Manage my add-ins**.
6. Under **Custom add-ins**, click **Add a custom add-in** > **Add from file...**.
7. Upload the `manifest.xml` file from this project.
   - *Note: You may need to update the `SourceLocation` in `manifest.xml` to match your `APP_URL` if not running locally.*

### 3. Sideload in Outlook Desktop (Classic)
1. Open Outlook Desktop.
2. Go to **File** > **Manage Add-ins** (this opens the web portal).
3. Follow the steps for Outlook Web above.

### 4. Mobile (iOS/Android)
1. Once sideloaded via the web, the add-in will automatically appear in your mobile Outlook app under the "Apps" or "..." menu when viewing an email.

## Configuration
- **VIPs**: Add domains or emails in the Settings tab.
- **Escalations**: Configure manager emails and SLA times in Settings.

## Technical Stack
- **Frontend**: React, Tailwind CSS, Motion, Lucide.
- **Backend**: Express, SQLite (better-sqlite3).
- **Add-in**: Office.js, XML Manifest.
