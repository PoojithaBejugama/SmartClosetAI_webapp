# 👗 SmartClosetAI

> Your personal AI-powered wardrobe assistant — organize your clothes, build outfits, and get styled by AI.

[![Built with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## 🤔 What is SmartClosetAI?

Ever stared at a full closet and thought *"I have nothing to wear"*? SmartClosetAI solves that.

**Upload photos of your clothes**, and SmartClosetAI organizes them into a beautiful digital wardrobe. Mix and match pieces to build outfits, save your favorites, and let AI suggest looks you'd never have thought of.

It's like having a personal stylist — in your pocket.

---

## ✨ Key Features

| Feature | What it does |
|---|---|
| 📸 **Smart Upload** | Take a photo or drag-and-drop — your item is added to your closet instantly |
| 👚 **Digital Closet** | Browse all your clothes in a clean visual grid. Filter by type, color, or season |
| 🧩 **Outfit Builder** | Drag pieces together to create complete outfits. Save the ones you love |
| 🤖 **AI Recommendations** | Get personalized outfit suggestions based on what you own and your style |
| 💾 **Saved Outfits** | Keep a collection of your go-to looks for quick access |
| 📱 **Mobile Ready** | Works beautifully on your phone with a bottom nav bar and PWA install support |

---

## 📱 Screenshots

<!-- Add your screenshots here -->
<!-- ![Dashboard](screenshots/dashboard.png) -->
<!-- ![Closet](screenshots/closet.png) -->
<!-- ![Outfit Builder](screenshots/outfit-builder.png) -->

---

## 🚀 Try It Out

### Quick Start

```bash
# Clone the repo
git clone <YOUR_GIT_URL>
cd smartcloset

# Install dependencies
npm install

# Start the app
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) — the app runs in **demo mode** with sample data, so you can explore everything right away. Any email/password works on the login screen.

### Install as an App

SmartClosetAI is a **Progressive Web App (PWA)** — you can install it on your phone's home screen for a native app-like experience. Visit `/install` in the app for step-by-step instructions.

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev) | UI framework |
| [TypeScript](https://typescriptlang.org) | Type-safe JavaScript |
| [Vite](https://vitejs.dev) | Lightning-fast build tool |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Beautiful UI components |
| [Framer Motion](https://motion.dev) | Smooth animations |
| [React Router v6](https://reactrouter.com) | Page navigation |
| [TanStack Query](https://tanstack.com/query) | Data fetching & caching |
| [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Form handling & validation |

### Backend

<!-- 
TODO: Fill in your backend details here

| Technology | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | REST API framework |
| [PostgreSQL](https://postgresql.org) | Database |
| ... | ... |
-->

> 🔧 **Backend coming soon** — The frontend is fully built and ready to connect. See [DETAILED_README.md](DETAILED_README.md) for the complete API contract and integration guide.

### Authentication

<!-- 
TODO: Fill in your auth implementation details here

| Technology | Purpose |
|---|---|
| JWT | Token-based auth |
| ... | ... |
-->

> 🔧 **Auth integration coming soon** — The frontend includes a complete login/signup flow with protected routes. Currently runs in demo mode.

### Cloud & Deployment

<!-- 
TODO: Fill in your cloud/deployment details here

| Service | Purpose |
|---|---|
| AWS S3 / Cloudinary | Image storage |
| ... | ... |
-->

> 🔧 **Cloud setup coming soon** — See [DETAILED_README.md](DETAILED_README.md) for deployment options and image storage strategies.

---

## 📂 Project Structure

```
src/
├── components/    → Reusable UI pieces (cards, buttons, nav)
├── pages/         → Each screen in the app (Dashboard, Closet, etc.)
├── layouts/       → Page shells (sidebar, navbar, bottom nav)
├── hooks/         → Data fetching and app logic
├── services/      → API connection layer
├── types/         → Data shape definitions
├── utils/         → Helper functions
└── data/          → Sample data for demo mode
```

📖 For a detailed breakdown of every folder, see [DETAILED_README.md](DETAILED_README.md).

---

## 🗺 Roadmap

- [x] Digital closet with visual card grid
- [x] Clothing upload with metadata
- [x] Outfit builder
- [x] AI recommendation engine (frontend)
- [x] Mobile-responsive design + PWA
- [x] About page with FAQ
- [ ] Backend API integration
- [ ] Real AI-powered clothing detection
- [ ] Social outfit sharing
- [ ] Dark mode
- [ ] Seasonal wardrobe analytics

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

<!-- TODO: Choose your license -->
<!-- This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details. -->

---

## 💬 Questions?

<!-- TODO: Add your contact info -->
<!-- Feel free to reach out at [your-email@example.com] or open an issue! -->

---

<p align="center">
  Made with ❤️ using <a href="https://lovable.dev">Lovable</a>
</p>
