import React from 'react';
import { Helmet } from 'react-helmet-async';
import { games } from '../data/games';

const DynamicSEO = ({ currentPage, currentGame }) => {
  // 1. Titles and Meta Descriptions
  const titles = {
    home: 'RetroRift | Play GBA, NDS & Retro Games Online',
    library: 'RetroRift | 100+ Classic Games - Play in Browser',
    favorites: 'RetroRift | Your Collection - Quick Access Saves',
    profile: 'RetroRift | Profile - Achievements & Progress',
    login: 'RetroRift | Sign In - Secure Online Sync',
    player: currentGame ? `${currentGame.title} | Play on RetroRift` : 'RetroRift | Play Retro Games'
  };
  
  const descriptions = {
    home: 'Play GBA, NDS, NES, SNES, and GB games instantly on RetroRift. High-performance browser emulation with secure cloud saves. No downloads required.',
    library: 'Browse over 100+ classic retro games. No downloads required. Experience high-speed browser-based emulation for the best gaming experience.',
    favorites: 'Access your favorited retro games instantly. All your progress is synced securely via your personal online storage.',
    profile: 'Track your retro gaming journey. View your global XP, unlock rare achievements, and customize your atmospheric dashboard.',
    login: 'Sign in to RetroRift to enable secure online sync, persistent save states, and achievement tracking across all your devices.',
    player: `Currently playing ${currentGame?.title || 'a classic retro game'} on RetroRift. Enjoy lag-free emulation with persistent save state support.`
  };

  const currentTitle = titles[currentPage] || titles.home || 'RetroRift | Play Retro Games Online';
  const currentDesc = descriptions[currentPage] || descriptions.home || '';
  const defaultImage = 'https://retrorift.online/og-image.png';
  const gameImage = currentGame?.thumbnail ? `https://retrorift.online${currentGame.thumbnail}` : defaultImage;

  // 2. Canonical URL
  let cleanPath = currentPage === 'home' ? '/' : `/${currentPage}`;
  if (currentPage === 'player' && currentGame) {
    const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/pok-mon/g, 'pokemon').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    cleanPath = `/play/${normalize(currentGame.title)}`;
  }
  const canonicalUrl = `https://retrorift.online${cleanPath}`;

  // 3. Game Schema (JSON-LD)
  let gameListSchema = null;
  if (currentPage === 'library' || currentPage === 'home') {
    const featuredGames = games.slice(0, 10);
    gameListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": featuredGames.map((game, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "VideoGame",
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
  }

  // 4. Breadcrumb Schema
  let breadcrumbSchema = null;
  if (currentPage !== 'home') {
    breadcrumbSchema = {
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
          "name": titles[currentPage]?.split('|')[1]?.trim() || currentPage,
          "item": canonicalUrl
        }
      ]
    };
  }

  return (
    <Helmet>
      {/* Standard SEO Tags */}
      <title>{currentTitle}</title>
      <meta name="description" content={currentDesc} />
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph / Facebook */}
      <meta property="og:title" content={currentTitle} />
      <meta property="og:description" content={currentDesc} />
      <meta property="og:image" content={gameImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:title" content={currentTitle} />
      <meta name="twitter:description" content={currentDesc} />
      <meta name="twitter:image" content={gameImage} />

      {/* Structured Data / JSON-LD */}
      {gameListSchema && (
        <script type="application/ld+json">
          {JSON.stringify(gameListSchema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default DynamicSEO;
