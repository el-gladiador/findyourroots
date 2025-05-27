# Find Your Roots - Family Tree Application

A modern family tree application built with Next.js, TypeScript, and Firebase Firestore. Create, visualize, and manage your family tree with a professional, interactive interface.

## ✨ Features

- **Professional Family Tree Visualization**: JointJS-inspired clean, modern tree layout
- **Firebase Firestore Integration**: Real-time data synchronization across devices
- **Mobile-First Design**: Touch-friendly interface with pinch-to-zoom and pan gestures
- **Real-time Updates**: Automatic synchronization when family members are added/edited/removed
- **Offline Fallback**: LocalStorage backup when Firebase is unavailable
- **Modern UI/UX**: Clean card design, smooth animations, and responsive layout

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- Firebase project (for Firestore database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd findyourroots
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase configuration:
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase project credentials in `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

### Core Components

- **`FamilyContext`**: Global state management with Firebase integration
- **`EnhancedFamilyTree`**: Main tree visualization component with professional layout
- **`FirestoreService`**: Database abstraction layer for all Firestore operations
- **`AddPerson/EditPerson`**: Forms for family member management

### Firebase Integration

The application uses Firebase Firestore for:
- **Real-time data synchronization**: Changes are instantly reflected across all connected clients
- **Persistent storage**: Family tree data is stored in the cloud
- **Offline support**: LocalStorage fallback ensures the app works without internet

### Key Files

```
src/
├── contexts/FamilyContext.tsx     # Global state with Firebase integration
├── lib/
│   ├── firebase.ts                # Firebase configuration
│   └── firestore.ts              # Firestore service layer
├── components/
│   ├── EnhancedFamilyTree.tsx     # Professional tree visualization
│   ├── AddPerson.tsx             # Add family member form
│   └── EditPerson.tsx            # Edit family member form
└── types/family.ts               # TypeScript interfaces
```

## 🎨 Design Features

### Enhanced Family Tree

- **Professional Layout**: Automatic tree positioning with proper spacing
- **Mobile Support**: Touch gestures for pan and zoom
- **Modern Cards**: Clean, card-based design for family members
- **Connection Lines**: SVG-based lines that automatically adjust
- **Responsive Design**: Adapts to different screen sizes

### User Experience

- **Loading States**: Visual feedback during data operations
- **Error Handling**: Graceful error messages and fallbacks
- **Real-time Updates**: Instant synchronization across devices
- **Accessibility**: Keyboard navigation and screen reader support

## 🔧 Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Configure security rules for your needs
4. Get your config from Project Settings > General > Your apps

## 📱 Mobile Support

The application is fully optimized for mobile devices:
- Touch-based pan and zoom
- Responsive card layouts
- Mobile-friendly controls
- Optimized touch targets

## 🔒 Security

- Firebase security rules should be configured for your use case
- Environment variables are used for sensitive configuration
- Client-side validation with server-side enforcement

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Platform
- Self-hosted

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
