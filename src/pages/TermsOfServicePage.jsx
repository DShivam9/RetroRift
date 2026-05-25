import React, { useEffect } from 'react';
import { ArrowLeft, Terminal } from 'lucide-react';

export default function TermsOfServicePage({ navigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-[800px] mx-auto text-gray-300 font-sans">
      
      <button 
        onClick={() => navigate('home')} 
        className="flex items-center gap-2 text-[#8b5cf6] hover:text-white mb-12 transition-colors font-medium text-sm tracking-wide"
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Terms of Service</h1>
        <div className="h-px w-full bg-gradient-to-r from-[#8b5cf6] to-transparent opacity-50 mb-4"></div>
        <p className="text-sm text-gray-500 tracking-wide">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </header>

      <main className="space-y-12">
        
        <div className="border-l-2 border-red-500 pl-6 py-2">
          <h3 className="font-semibold text-red-500 text-sm tracking-wider mb-2 uppercase">Legal Disclaimer</h3>
          <p className="text-sm leading-relaxed text-red-200/80">
            RetroRift provides hosting infrastructure to enable cloud-based emulation. While we host ROM files strictly to facilitate the emulation experience within our application, <strong className="text-red-400 font-bold">we do not distribute, curate, or maintain a repository of ROMs.</strong> Users are solely responsible for the legal status, acquisition, and copyright compliance of any game files they interact with or upload to the platform.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p className="leading-relaxed font-light">
            By accessing and using the RetroRift platform, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">2. Copyright Policy</h2>
          <p className="leading-relaxed font-light">
            RetroRift operates as an infrastructure provider for web-based emulation. We adhere to copyright law and do not endorse digital piracy.
          </p>
          <ul className="list-disc pl-5 space-y-2 font-light text-gray-400 marker:text-[#8b5cf6]">
            <li>While files are hosted on our servers to enable cloud-saving and gameplay, we do not provide a public directory or distribution network for copyrighted ROMs.</li>
            <li>Users must legally own a physical copy of any game they play using our platform and must use legally obtained personal backups.</li>
            <li>Any copyright infringement committed by users utilizing our infrastructure is solely the legal liability of the individual user.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">3. Service Availability</h2>
          <p className="leading-relaxed font-light">
            RetroRift is provided on an "AS IS" and "AS AVAILABLE" basis. We reserve the right to modify, suspend, or discontinue the service at any time without prior notice. We shall not be held liable if the service becomes temporarily or permanently unavailable.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">4. User Conduct</h2>
          <p className="leading-relaxed font-light">
            You agree not to use the service in any manner that could cause damage, disable, overburden, or impair the RetroRift servers. Engaging in reverse engineering, unauthorized access, denial of service attacks, or exploitation of our cloud infrastructure is strictly prohibited.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">5. Limitation of Liability</h2>
          <p className="leading-relaxed font-light">
            To the maximum extent permitted by applicable law, in no event shall RetroRift or its maintainers be liable for any indirect, punitive, incidental, special, or consequential damages (including, without limitation, damages for loss of data, corrupted game saves, or business interruption) arising out of the use or inability to use the platform.
          </p>
        </section>

      </main>
    </div>
  );
}
