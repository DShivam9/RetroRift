import React, { useEffect } from 'react';
import { games } from '../data/games';

const DynamicSEO = ({ currentPage, currentGame }) => {
  useEffect(() => {
    // 1. Update Title and Meta Description
    const titles = {
      home: 'RetroRift | Home - The Ultimate Retro Gaming Hub',
      library: 'RetroRift | Library - Explore 100+ Retro Classics',
      favorites: 'RetroRift | Favorites - Your Curated Collection',
      profile: 'RetroRift | Profile - Achievements & Customization',
      login: 'RetroRift | Login - Sync Your Cloud Saves',
      player: currentGame ? `Playing ${currentGame.title} | RetroRift` : 'Playing Game | RetroRift'
    };
    
    const descriptions = {
      home: 'Experience the next generation of retro gaming. Play GBA, NES, and SNES games instantly with cloud-synced saves and a high-end cinematic interface.',
      library: 'Explore our massive collection of retro games. No downloads, just high-performance emulation directly in your browser.',
      favorites: 'Access your favorite retro games instantly. Keep all your top picks in one place with cloud synchronization.',
      profile: 'Level up your gaming journey. View your XP, unlock trophies, and customize your atmospheric dashboard.',
      login: 'Sign in to RetroRift to unlock cloud saves, achievements, and cross-device synchronization for your retro games.',
      player: `Now playing ${currentGame?.title || 'a classic retro game'} on RetroRift. Experience lag-free emulation with cloud save support.`
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

    // 3. Update Canonical URL
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      const cleanPath = currentPage === 'home' ? '/' : `/${currentPage}`;
      existingCanonical.setAttribute('href', `https://retrorift.online${cleanPath}`);
    }

  }, [currentPage, currentGame]);

  return null; // This component doesn't render anything
};

export default DynamicSEO;
