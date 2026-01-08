'use client';

/**
 * 🚀 AWS EC2 Auto-Deployment Status Indicator
 * 
 * This component shows when the application was last deployed via GitHub Actions.
 * The build timestamp is injected at build time to track deployments.
 * 
 * Deployment Info:
 * - Auto-deploys on push to main branch
 * - Workflow: .github/workflows/deploy-ec2.yml
 * - EC2 Instance: 54.165.116.208
 */

export default function DeploymentStatus() {
  // Build timestamp - updated on each deployment
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();
  const buildDate = new Date(buildTime);
  
  // Format: "Jan 7, 2026 7:45 PM"
  const formattedDate = buildDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: '500',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        border: '2px solid rgba(255, 255, 255, 0.2)'
      }}
      title={`Last deployed: ${formattedDate}`}
    >
      <span style={{ 
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#4ade80',
        animation: 'pulse 2s infinite',
        boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)'
      }} />
      <span>🚀 AWS Deployed v2</span>
      <span style={{ opacity: 0.8, fontSize: '10px' }}>{formattedDate}</span>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

