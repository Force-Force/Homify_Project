import { useState, useEffect } from 'react';
import { Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { CAROUSEL_IMAGES } from './carouselData';

const Carosel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);

  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden min-h-screen">
      {CAROUSEL_IMAGES.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-1000 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(27, 67, 50, 0.45), rgba(27, 67, 50, 0.55)), url('${image.url}')`,
            opacity: currentSlide === index ? 1 : 0,
            zIndex: currentSlide === index ? 1 : 0,
          }}
        >
          <div className="absolute top-8 right-8">
            <div className="flex items-center gap-2">
              <div className="bg-homify-primary p-2 rounded-xl">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div className="text-white">
                <div className="font-bold text-2xl">HOMIFY</div>
                <div className="text-xs tracking-wider opacity-80">CHAQUE MAISON COMPTE</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-24 left-8 right-8">
            <h1 className="text-white text-4xl font-bold leading-tight">{image.title}</h1>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all"
        aria-label="Slide suivant"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {CAROUSEL_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carosel;
