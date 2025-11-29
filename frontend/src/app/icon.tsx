import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

// Required for static export
export const dynamic = 'force-static';
export const revalidate = false;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e40af',
          color: '#ffffff',
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        WPG
      </div>
    ),
    size,
  );
}
