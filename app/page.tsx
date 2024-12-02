import ImageConverter from './components/ImageConverter';

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-4 bg-background text-foreground">
      <ImageConverter />
    </main>
  );
}
