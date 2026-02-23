import Image from 'next/image';

export default function HeroBanner() {
  return (
    <section className="relative h-[50vh] w-full overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
        alt="Casa moderna de lujo"
        fill
        className="object-cover"
        priority={true}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
          Encuentra el hogar de tus sueños
        </h1>
        <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl drop-shadow">
          Las mejores propiedades en Colombia para vivir o invertir
        </p>
      </div>
    </section>
  );
}
