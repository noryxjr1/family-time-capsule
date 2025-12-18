export default function Head() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const frame = {
    version: "1",
    imageUrl: `${appUrl}/og-image.svg`,
    button: {
      title: "Open app",
      action: {
        type: "launch_frame",
        name: "Family Memory Capsule",
        url: appUrl,
        splashImageUrl: `${appUrl}/splash.svg`,
        splashBackgroundColor: "#ffffff",
      },
    },
  };

  return (
    <>
      <meta property="fc:frame" content={JSON.stringify(frame)} />
    </>
  );
}
