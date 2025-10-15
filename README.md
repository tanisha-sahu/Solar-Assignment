
# Canva-temp: React Canvas Editor

A professional drawing pad and canvas editor built with React, Vite, Tailwind CSS, and Firebase. This project allows users to create, edit, and save canvases with a modern, responsive UI and real-time cloud storage.

---

## Features

- **Create and Edit Canvases:** Draw shapes, lines, text, and more using an intuitive editor powered by [fabric.js](https://fabricjs.com/).
- **Real-Time Cloud Storage:** Save and load canvases using Firebase Firestore.
- **Modern UI:** Styled with Tailwind CSS for a clean, responsive experience.
- **Routing:** Seamless navigation between homepage and editor using React Router.
- **Export & Delete:** Export your canvas or delete it when no longer needed.

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

---

## Project Structure
```
Canva-temp/
├── public/
├── src/
│   ├── components/
│   │   ├── CanvasEditor.jsx
│   │   └── HomePage.jsx
│   ├── App.jsx
│   ├── firebase.js
│   ├── main.jsx
│   ├── App.css
│   └── index.css
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## Technologies Used
- **React**: UI library
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Firebase**: Cloud database
- **fabric.js**: Canvas drawing

---

## Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Replace the config in `src/firebase.js` with your own credentials.
3. Enable Firestore in your Firebase project.

---

## Screenshots

> **Note:** The `images` folder is currently empty. Add screenshots (e.g., `images/homepage.png`, `images/editor.png`) to showcase your app here.

```
![Homepage](images/homepage.png)
![Canvas Editor](images/editor.png)
```

---

## License

This project is licensed under the MIT License.

---

## Author

Developed by Tanisha Sahu.
