import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { CAROUSEL_IMAGES } from './carouselData';

const MobileCarousel = () => {
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
    <div>
      <div className="lg:hidden mb-4">
        <Link to="/" className="flex items-center gap-2 text-homify-muted mb-4 hover:text-homify-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Retour à l'accueil</span>
        </Link>
      </div>

      <div className="relative h-48 rounded-2xl overflow-hidden mb-6 shadow-lg">
        {CAROUSEL_IMAGES.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(27, 67, 50, 0.45), rgba(27, 67, 50, 0.55)), url('${image.url}')`,
              opacity: currentSlide === index ? 1 : 0,
            }}
          >
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-lg font-semibold leading-tight">{image.title}</p>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
          aria-label="Slide précédent"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
          aria-label="Slide suivant"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {CAROUSEL_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileCarousel;
