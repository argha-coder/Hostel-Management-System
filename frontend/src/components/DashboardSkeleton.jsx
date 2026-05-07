import React from 'react';
import { motion } from 'framer-motion';

const SkeletonCard = () => (
  <div className="glass-card" style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '14px' }} />
    </div>
    <div className="skeleton" style={{ width: '100px', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
    <div className="skeleton" style={{ width: '60px', height: '32px', borderRadius: '4px' }} />
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh', position: 'relative' }}>
      <div style={{ width: '300px', padding: '48px' }}>
         {/* Sidebar space */}
      </div>
      <main style={{ padding: '48px', flex: 1 }}>
        <header style={{ marginBottom: '48px' }}>
           <div className="skeleton" style={{ width: '250px', height: '40px', marginBottom: '12px', borderRadius: '8px' }} />
           <div className="skeleton" style={{ width: '350px', height: '20px', borderRadius: '4px' }} />
        </header>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div className="glass-card" style={{ flex: 2, padding: '32px', minHeight: '400px' }}>
            <div className="skeleton" style={{ width: '200px', height: '24px', marginBottom: '32px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '100%', height: '250px', borderRadius: '24px' }} />
          </div>
          <div className="glass-card" style={{ flex: 1, padding: '32px', minHeight: '400px' }}>
            <div className="skeleton" style={{ width: '150px', height: '24px', marginBottom: '32px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '100%', height: '80px', marginBottom: '16px', borderRadius: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: '16px' }} />
          </div>
        </div>
      </main>
      <style>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
        }
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default DashboardSkeleton;
