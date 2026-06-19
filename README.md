# E-Irrigation — Digital Platform for Irrigation File Management
### ORMVAM · Office Régional de Mise en Valeur Agricole de la Moulouya

---

## 1. Introduction

### 1.1 Overview
E-Irrigation is a full-stack web application designed to digitize and centralize the complete lifecycle of drip irrigation project files at ORMVAM. It replaces paper-based procedures with a secure, role-based, cloud-connected platform accessible from any device.

### 1.2 Purpose
- Eliminate manual hydraulic calculations on Excel
- Centralize file management with full traceability
- Enable structured communication between agents and installation companies
- Store all documents and data permanently on cloud infrastructure
- Enforce role-based access control on every action

---

## 2. Technical Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Material UI (MUI) |
| Backend | Python 3 + Flask |
| Database | Supabase PostgreSQL (cloud) |
| File Storage | Supabase Storage (PDF files) |
| Authentication | JWT (HttpOnly cookies) + bcrypt |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |
| ORM | SQLAlchemy + psycopg2 |

---

## 3. Project Structure

### 3.1 Frontend (React)
```text
frontend/
├── src/
│   ├── Axios/              # API calls (folderAxios, conceptionAxios, backLogAxios...)
│   ├── components/         # UI components (FoldersList, FolderDetail, ChatDrawer...)
│   ├── pages/              # Dashboard, Login
│   └── main.jsx
├── .env                    # VITE_API_URL=http://localhost:5000/api
├── .env.production         # VITE_API_URL=https://e-irrigation.onrender.com/api
```

### 3.2 Backend (Flask)
```text
backend/
├── api/
│   ├── api_folder.py           # Folder CRUD + file upload routes
│   ├── api_backlog.py          # Messaging routes
│   ├── api_conception.py       # Hydraulic calculation routes
│   └── api_user.py             # User management routes
├── engine/
│   ├── extensions.py           # SQLAlchemy db + Supabase client
│   ├── db_folder.py            # FolderDB SQLAlchemy model
│   ├── db_user.py              # UserDB SQLAlchemy model
│   ├── db_backlog.py           # BacklogBoxDB SQLAlchemy model
│   ├── db_conception.py        # ConceptionDB SQLAlchemy model
│   ├── db_document.py          # DocumentDB SQLAlchemy model
│   ├── storage_folder.py       # Folder CRUD operations
│   ├── storage_user.py         # User CRUD operations
│   ├── storage_backlog.py      # Backlog CRUD operations
│   └── storage_conception.py   # Conception CRUD operations
├── models/
│   ├── folder.py               # Folder business logic model
│   ├── user.py                 # User business logic model
│   ├── backlog_box.py          # BacklogBox + messages model
│   └── conception_calculator.py # Hydraulic calculation engine
├── utils/
│   └── auth.py                 # JWT authentication middleware
├── .env                        # Local environment variables
└── server.py                   # Flask app entry point
```

---

## 4. Environment Variables

### Backend `.env`
```env
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=supabase_anon_key
PORT=5000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### Frontend `.env.production`
```env
VITE_API_URL=https://e-irrigation.onrender.com/api
```

---

## 5. User Roles & Permissions (RBAC)

| Permission | Admin | Agent | Company | Farmer |
|---|---|---|---|---|
| View all folders | ✅ | ✅ | ❌ | ❌ |
| View own folders | ✅ | ✅ | ✅ | ✅ |
| Create folder | ✅ | ✅ | ✅ | ✅ |
| Edit folder | ✅ | ✅ | ✅ | ❌ |
| Delete folder | ✅ | ❌ | ❌ | ❌ |
| Launch conception | ✅ | ✅ | ✅ | ❌ |
| Delete conception | ✅ | ✅ | ✅ | ❌ |
| Send messages | ✅ | ✅ | ✅ | ❌ |
| View all messages | ✅ | ✅ | ❌ | ❌ |
| Manage accounts | ✅ | ❌ | ❌ | ❌ |

> **Company users**: `user_id = phone_number` — they access only folders where `company_phone` matches their `user_id`.

---

## 6. Core Features

### 6.1 Folder Management
- Create folders with automatic naming: `DOS_{CIN}_{Year}`
- Fields: beneficiary, CIN, phase, CMV, crop, area, financials, company phone
- Auto-calculated fields: `investment_per_hectare`, `percentage`
- Edit folders with existing documents displayed
- Cascade delete: folder → documents + conception + backlog

### 6.2 Document Management (PDF)
- Upload multiple PDFs during folder creation or update
- Files stored in **Supabase Storage** bucket `documents/`
- Filenames sanitized (Arabic/special characters handled automatically)
- Public URLs stored in `documents` PostgreSQL table
- Download directly from folder detail view

### 6.3 Hydraulic Conception Engine
- Full drip irrigation hydraulic design calculator
- Sections: water needs, emitters, irrigation stations, laterals, sub-mains, main pipes, pumps, basin
- Formulas: Darcy-Weisbach, Blasius friction factor, HMT calculation
- Results displayed in two modes:
  - **Table view** — 9 structured sections with all parameters
  - **Chart view** — interactive recharts diagrams
- Export to PDF via browser print
- 1 folder = 1 conception (business rule enforced)
- Auto-save on calculation

### 6.4 Messaging System (BacklogBox)
- One private chat thread per folder
- Participants: ORMVAM team (agents/admin) ↔ company (identified by phone number)
- Supports text messages + PDF file attachments
- Messages stored as JSONB array in PostgreSQL
- Optimistic UI updates for instant feedback
- File uploads stored in `backlog/{backlogbox_id}/` in Supabase Storage
- Admin/agent see all conversations; company sees only their own

### 6.5 User Account Management
- Admin creates accounts from the admin portal
- Roles: `admin`, `agent`, `company`, `farmer`
- Company `user_id` = phone number (unique identifier)
- Passwords hashed with bcrypt

---

## 7. Database Schema

```text
users
  user_id (PK) · fullName · email · password · role · phone · national_id

folders
  folder_id (PK) · folder_name · beneficiary_name · national_id
  deposit_year · phase · ct_cda_cvm · adress · adress_corr
  serial_number_saba · area_brut · area_net · investment
  investment_per_hectare · reimbursed_investment · subsidy
  percentage · company · company_phone · crop · documents
  comment · created_by (FK→users) · created_at · updated_at

documents
  doc_id (PK) · folder_id (FK→folders) · file_name
  file_url · uploaded_by (FK→users) · uploaded_at

backlog_boxes
  backlogbox_id (PK) · folder_id (FK→folders)
  created_by (FK→users) · company_id · messages (JSONB)
  created_at · updated_at

conceptions
  conception_id (PK) · folder_id (FK→folders, UNIQUE)
  input (JSONB) · results (JSONB) · created_at · updated_at
```

---

## 8. API Endpoints

### Folders
```text
POST   /api/create-folder          Create folder + upload PDFs (multipart)
GET    /api/allfolders             List folders (filtered by role)
GET    /api/folders/:id            Get folder detail + documents
PUT    /api/folders/:id            Update folder fields (JSON)
POST   /api/folders/:id/upload     Upload new PDFs to existing folder
DELETE /api/folders/:id            Delete folder + cascade all related data
```

### Conceptions
```text
POST   /api/calculate                  Run hydraulic calculations
POST   /api/conceptions/save           Save/update conception (upsert)
GET    /api/conceptions/folder/:id     Get conception by folder
DELETE /api/conceptions/folder/:id     Delete conception by folder
```

### Messaging
```text
GET    /api/backlog/folder/:id     Get or create chat thread for folder
POST   /api/backlog/:id            Send message (text + optional PDF)
GET    /api/backlogs               List all backlogs (filtered by role)
```

### Users
```text
POST   /api/register               Create user account (admin only)
POST   /api/login                  Login + set JWT cookie
GET    /api/auth/me                Get current user from token
POST   /api/logout                 Clear session cookie
```

---

## 9. Security

### 9.1 Authentication
- JWT stored in **HttpOnly cookies** (not localStorage — XSS safe)
- Every protected route uses `@require_auth` decorator
- Token validated on every request server-side

### 9.2 Role-Based Access Control
- Every route checks `current_user.role` before executing
- Company users filtered at DB query level by `company_phone`
- Admin-only actions: delete folder, manage accounts

### 9.3 File Security
- Filenames sanitized with `unicodedata.normalize` + regex before upload
- Arabic, accented and special characters automatically converted to ASCII
- Files organized by path: `folders/{uuid}_{safe_name}.pdf`

### 9.4 Database
- Supabase PostgreSQL with Row Level Security configurable
- Connection via IPv4 pooler URL (WSL and Render compatible)
- All passwords hashed with bcrypt before storage

---

## 10. Local Development Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python3 server.py
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 11. Deployment

### Render (Backend)
```text
SECRET_KEY   = your_secret_key
DATABASE_URL = postgresql://postgres.xxxx:password@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
SUPABASE_URL = https://xxxx.supabase.co
SUPABASE_KEY = your_anon_key
PORT         = 5000
```

### Netlify (Frontend)
```text
VITE_API_URL = https://e-irrigation.onrender.com/api

Base directory:    frontend
Build command:     npm run build
Publish directory: frontend/dist
```

---

## 12. Smart Design Decisions

| Decision | Reason |
|---|---|
| JSONB for messages array | Keeps embedded chat structure without a separate messages table |
| `flag_modified()` on JSONB | Forces SQLAlchemy to detect changes inside JSON columns |
| `company_id = phone_number` | No extra lookup needed — phone IS the unique company identifier |
| Filename sanitization | Handles Arabic filenames that cause Supabase Storage `InvalidKey` errors |
| IPv4 pooler URL | Bypasses IPv6 connectivity issues on WSL and Render free tier |
| FormData for create, JSON for update | Files need multipart; field updates don't — keeps both routes clean |
| Cascade delete in API layer | FK constraints + explicit deletion order prevents orphan records |
| `_LIGHTWEIGHT_FIELDS` filter | Reduces payload on folder list — full data loaded only on detail view |
| `.env.production` for Vite | Auto-switches API URL between local and production without code changes |
| CSS grid over MUI Grid | Bypasses MUI breakpoint issues caused by narrow parent containers |

---

## 13. Future Enhancements

- [ ] Real-time messaging with WebSockets
- [ ] Mobile application (React Native)
- [ ] GIS parcel mapping integration
- [ ] Electronic signature for document validation
- [ ] SABA system integration (Système des Aides et Bonifications Agricoles)
- [ ] Email/SMS notifications on file status changes
- [ ] Audit log dashboard for administrators
- [ ] PDF report generation with ORMVAM letterhead
- [ ] Multi-language support (Arabic / French)

---

## 14. Conclusion

E-Irrigation transforms the irrigation file management process at ORMVAM from a paper-based, error-prone workflow into a secure, traceable, and fully digital platform. Every component — from the hydraulic calculation engine to the role-based messaging system — was designed to match the real operational needs of the ORMVAM field teams and their company partners.

---

*ORMVAM · E-Irrigation v1.0 · Built with React + Flask + Supabase*
EOF
