import React, { useEffect } from 'react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function PrivacyPolicyPage({ navigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-[800px] mx-auto text-gray-300 font-sans">
      
      <button 
        onClick={() => navigate('home')} 
        className="flex items-center gap-2 text-[#06b6d4] hover:text-white mb-12 transition-colors font-medium text-sm tracking-wide"
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Privacy Policy</h1>
        <div className="h-px w-full bg-gradient-to-r from-[#06b6d4] to-transparent opacity-50 mb-4"></div>
        <p className="text-sm text-gray-500 tracking-wide">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </header>

      <main className="space-y-12">
        
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
          <p className="leading-relaxed font-light">
            When you use the RetroRift platform, we collect specific types of data essential for providing the service:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-light text-gray-400 marker:text-[#06b6d4]">
            <li><strong className="text-gray-200">Account Data:</strong> If you use our authentication system, we store your user ID and chosen username to sync your profile.</li>
            <li><strong className="text-gray-200">Game Data:</strong> Emulation save states, in-game progress, and Experience Points (XP) are stored locally in your browser and synced to our cloud database.</li>
            <li><strong className="text-gray-200">Usage Data:</strong> We may collect non-personally identifiable metrics, such as emulator performance and errors, to monitor platform stability.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">2. How We Use Your Data</h2>
          <p className="leading-relaxed font-light">
            Your data is used strictly for platform functionality and never for external marketing. We use this data to:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-light text-gray-400 marker:text-[#06b6d4]">
            <li>Provide, maintain, and secure the RetroRift emulation environment and cloud saves.</li>
            <li>Sync your settings across your devices.</li>
            <li>Analyze platform usage to improve performance and stability.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">3. Data Security</h2>
          <p className="leading-relaxed font-light">
            We implement security measures to protect your account and save data against unauthorized access. However, please be advised that no method of transmission over the internet or electronic storage is completely secure. While we strive to protect your data, absolute security cannot be guaranteed.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">4. Third-Party Services</h2>
          <p className="leading-relaxed font-light">
            RetroRift uses third-party providers (such as Firebase) for authentication and database hosting. These partners maintain their own privacy policies. RetroRift does not sell, rent, or distribute your personal data to any third-party marketing or advertising companies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">5. Your Rights</h2>
          <p className="leading-relaxed font-light">
            You retain full control over your data. You have the right to request the complete deletion of your account and all associated cloud save data at any time. Local data can be deleted by clearing your browser cache and local storage.
          </p>
        </section>

      </main>
    </div>
  );
}
