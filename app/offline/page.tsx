export default function OfflinePage() {
  return (
    <html lang="bn">
      <head>
        <title>Offline — Code Craft BD</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body { margin: 0; background: #0a0a0f; color: white; font-family: system-ui, sans-serif;
                 display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .container { text-align: center; padding: 2rem; max-width: 400px; }
          .icon { font-size: 4rem; margin-bottom: 1.5rem; }
          h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.75rem; }
          p { color: rgba(255,255,255,0.5); font-size: 0.95rem; margin: 0 0 2rem; line-height: 1.6; }
          a { display: inline-block; padding: 0.75rem 2rem; background: #ef4444;
              color: white; text-decoration: none; border-radius: 0.75rem; font-weight: 600; }
          a:hover { background: #dc2626; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="icon">📡</div>
          <h1>You&apos;re Offline</h1>
          <p>
            No internet connection detected. Please check your network and try again.
            <br /><br />
            ইন্টারনেট সংযোগ নেই। আবার চেষ্টা করুন।
          </p>
          <a href="/">Try Again</a>
        </div>
      </body>
    </html>
  );
}

