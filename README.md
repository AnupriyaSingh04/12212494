## Shortener

A modern, responsive URL shortener application built with React, TypeScript, and Tailwind CSS. Transform long URLs into short, shareable links with detailed analytics and insights.

## 🚀 Live Demo

**[View Live Application](https://urlshortner04.netlify.app/)**

## ✨ Features

- **URL Shortening**: Convert long URLs into short, memorable links
- **Link Analytics**: Track clicks, referrers, and geographic data
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean interface built with shadcn/ui components
- **Fast Performance**: Built with Vite for lightning-fast development and builds
- **TypeScript Support**: Full type safety and better developer experience
- **Dark Mode**: Toggle between light and dark themes
- **Copy to Clipboard**: One-click copying of shortened URLs
- **Link History**: Keep track of previously shortened URLs
- **Custom Aliases**: Create custom short URLs (if supported)

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router Dom
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Theme**: Next Themes
- **Deployment**: Netlify

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 18 or higher)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd snappy-link-insights
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your configuration:
   ```env
   VITE_API_URL=your_api_endpoint
   VITE_APP_URL=your_app_domain
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...
├── pages/              # Application pages
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── styles/             # Global styles
└── main.tsx            # Application entry point
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Usage

1. **Shorten a URL**
   - Paste your long URL into the input field
   - Click the "Shorten" button
   - Copy the generated short URL

2. **View Analytics**
   - Click on any shortened URL to view detailed analytics
   - See click counts, referrer data, and geographic information

3. **Manage Links**
   - View your link history
   - Edit or delete existing links
   - Set custom aliases for your URLs

## 🎨 Customization

### Styling
The application uses Tailwind CSS for styling. You can customize the theme by modifying:
- `tailwind.config.ts` - Tailwind configuration
- `src/index.css` - CSS variables for colors and themes

### Components
UI components are built with shadcn/ui. To add new components:
```bash
npx shadcn-ui@latest add [component-name]
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔒 Security Features

- Input validation and sanitization
- HTTPS enforcement
- Rate limiting (if backend supports)
- XSS protection

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🧪 Testing

To run tests (when available):
```bash
npm run test
```

## 📈 Performance

- Lighthouse score: 90+ (Performance, Accessibility, Best Practices, SEO)
- Bundle size optimized with code splitting
- Lazy loading for improved initial load times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports

If you find any bugs, please create an issue on the GitHub repository with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: [anupriyasingh534@gmail.com]


## 🔮 Future Enhancements

- [ ] QR code generation for shortened URLs
- [ ] Bulk URL shortening
- [ ] API rate limiting dashboard
- [ ] Advanced analytics with charts
- [ ] Social media integration
- [ ] Custom domain support
- [ ] Link expiration settings
- [ ] Password protection for links

---

**Built with ❤️ using React and TypeScript**
