# Real-Time Collaborative Document Editor 

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

A high-performance, full-stack collaborative document editing platform. Engineered with a decoupled architecture to handle multiple users editing the same document simultaneously with zero perceived latency.

**🔗 Live Demo:** [https://document-editor-nine.vercel.app/](https://document-editor-nine.vercel.app/)

---

## ✨ Core Features

### ⚡ Real-Time Collaboration Engine
* **Instant Syncing:** Powered by WebSockets (Socket.io), document edits are broadcast to all connected clients in real-time.
* **Live Cursors & Presence:** See exactly where other users are typing within the document, replicating the seamless feel of Google Docs.
* **Conflict Resolution:** Robust state management ensures that simultaneous edits from different users merge cleanly without data loss.

### 🎨 Advanced Rich Text Editing
* **Headless Editor:** Built on top of Tiptap for complete control over the editing experience and DOM structure.
* **Custom Toolbar:** Fully tailored formatting options (bold, italic, underline, lists, alignments) designed for a distraction-free workflow.
* **Dynamic Ruler Component:** A custom-built, interactive document ruler that provides spatial awareness and professional formatting control.

### 🔒 Secure Authentication & Access
* **Protected Sessions:** Integrated NextAuth for seamless, secure user login and session handling.
* **Document Ownership:** Documents are tied to user accounts, ensuring private workspaces and controlled access.

### 🧭 Smart Dashboard & Navigation
* **Global Search:** Quickly find specific documents from your workspace directly from the home page.
* **Contextual UI:** Intelligent navbars that adapt dynamically based on whether you are browsing your dashboard or actively editing a document.

### 🏗️ Cloud-Native, Decoupled Architecture
* **Independent Scaling:** The Next.js frontend (hosted on Vercel) and the Node.js/Express WebSocket server (hosted on Render) operate independently, allowing the real-time engine to scale without bogging down the UI.
* **Persistent Storage:** A highly reliable PostgreSQL database (hosted on Neon) managed via Prisma ORM ensures your documents are safely stored and instantly retrievable.

---

## 🛠️ Tech Stack

### Frontend (Client)
* **Framework:** Next.js 15 (React 19)
* **Authentication:** NextAuth.js
* **Editor Engine:** Tiptap
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

### Backend (Real-Time Server)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Real-time Engine:** Socket.io
* **Deployment:** Render (Configured for Root Directory Monorepo Deployment)

### Database & ORM
* **Database:** PostgreSQL (Neon Serverless)
* **ORM:** Prisma Client

---

## 🚀 Local Development Setup

This project uses a decoupled structure where the Next.js frontend and Express backend share the same repository but run as independent services.

### Prerequisites
* Node.js (v18 or higher)
* A PostgreSQL database instance (Neon, Supabase, or local)

### 1. Clone the repository
```bash
git clone https://github.com/ChaitanyaZunzurkar/Document-Editor
cd document-editor
```

### 2. Install Dependencies
*Note: Due to Next.js 15 / React 19 RC strict peer dependencies, use the legacy flag for the root installation.*
```bash
npm install --legacy-peer-deps
cd server
npm install
cd ..
```

### 3. Environment Variables
You will need two `.env` files.

**Root Directory (`/.env`):**
```env
DATABASE_URL="postgresql://user:password@host:port/db?sslmode=require"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

**Server Directory (`/server/.env`):**
```env
DATABASE_URL="postgresql://user:password@host:port/db?sslmode=require"
PORT=3001
```

### 4. Database Setup
Generate the Prisma client and push the schema to your database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Running the Application
You will need two terminal windows to run both the frontend and backend simultaneously.

**Terminal 1: Start the Backend (from the root folder)**
```bash
cd server
npm run build
npm run start
```

**Terminal 2: Start the Frontend (from the root folder)**
```bash
npm run dev
```

The application will now be running at `http://localhost:3000`.

---

## 👨‍💻 Author
**Chaitanya Zunzurkar**
*Full-Stack Developer*
