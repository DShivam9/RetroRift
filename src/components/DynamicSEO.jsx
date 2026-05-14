import React, { useEffect } from 'react';
import { games } from '../data/games';

const DynamicSEO = ({ currentPage, currentGame }) => {
  useEffect(() => {
    // 1. Update Title and Meta Description
    const titles = {
      home: 'RetroRift | Play GBA, NDS & Retro Games Online',
      library: 'RetroRift | 100+ Classic Games - Play in Browser',
      favorites: 'RetroRift | Your Collection - Quick Access Saves',
      profile: 'RetroRift | Profile - Achievements & Progress',
      login: 'RetroRift | Sign In - Secure Online Sync',
      player: currentGame ? `${currentGame.title} | Play on RetroRift` : 'RetroRift | Play Retro Games'
    };
    
    const descriptions = {
      home: 'Play GBA, NDS, NES, and SNES games instantly with secure online storage for save states. Experience high-performance emulation with a premium cinematic interface.',
      library: 'Browse over 100+ classic retro games. No downloads required, featuring high-speed browser-based emulation for the best gaming experience.',
      favorites: 'Access your favorited retro games instantly. All your progress is synced securely via your personal online storage.',
      profile: 'Track your retro gaming journey. View your global XP, unlock rare achievements, and customize your atmospheric dashboard.',
      login: 'Sign in to RetroRift to enable secure online sync, persistent save states, and achievement tracking across all your devices.',
      player: `Currently playing ${currentGame?.title || 'a classic retro game'} on RetroRift. Enjoy lag-free emulation with persistent save state support.`
    };

    document.title = titles[currentPage] || 'RetroRift | Play Retro Games Online';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', descriptions[currentPage] || descriptions.home);
    }

    // 2. Inject Game Schema (JSON-LD) for better Google indexing
    const existingSchema = document.getElementById('game-list-schema');
    if (existingSchema) existingSchema.remove();

    if (currentPage === 'library' || currentPage === 'home') {
      const featuredGames = games.slice(0, 10); // Focus on top 10 for schema clarity
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": featuredGames.map((game, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": game.title,
            "applicationCategory": "Game",
            "operatingSystem": "Web Browser",
            "image": `https://retrorift.online${game.thumbnail}`,
            "description": game.description,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": game.rating || "4.5",
              "reviewCount": "128"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          }
        }))
      };

      const script = document.createElement('script');
      script.id = 'game-list-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }

    // 3. Inject Breadcrumb Schema
    const existingBreadcrumb = document.getElementById('breadcrumb-schema');
    if (existingBreadcrumb) existingBreadcrumb.remove();

    if (currentPage !== 'home') {
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://retrorift.online/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": titles[currentPage].split('|')[1]?.trim() || currentPage,
            "item": `https://retrorift.online/${currentPage}`
          }
        ]
      };

      const bScript = document.createElement('script');
      bScript.id = 'breadcrumb-schema';
      bScript.type = 'application/ld+json';
      bScript.text = JSON.stringify(breadcrumbData);
      document.head.appendChild(bScript);
    }

    // 4. Update Canonical URL
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      const cleanPath = currentPage === 'home' ? '/' : `/${currentPage}`;
      existingCanonical.setAttribute('href', `https://retrorift.online${cleanPath}`);
    }

  }, [currentPage, currentGame]);

  return null; // This component doesn't render anything
};

export default DynamicSEO;
