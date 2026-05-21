import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
const Carosel = () => {
      const [currentSlide, setCurrentSlide] = useState(0);
      const carouselImages = [
          {
            url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=1000&fit=crop',
            title: 'Welcome back to your home journey.'
          },
          {
            url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=1000&fit=crop',
            title: 'Your perfect home is waiting.'
          },
          {
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=1000&fit=crop',
            title: 'Continue your search today.'
          },
          {
            url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=1000&fit=crop',
            title: 'Find where you belong.'
          }
        ];

          useEffect(() => {
            const timer = setInterval(() => {
              setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
            }, 5000);
            return () => clearInterval(timer);
          }, []);
        
          const nextSlide = () => {
            setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
          };
        
          const prevSlide = () => {
            setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
          };
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Carousel Images */}
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${image.url}')`,
              opacity: currentSlide === index ? 1 : 0,
              zIndex: currentSlide === index ? 1 : 0
            }}
          >
            {/* Logo */}
            <div className="absolute top-8 right-8">
              <div className="flex items-center gap-2">
                <div className="bg-[#011753] p-2 rounded-lg">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <div className="font-bold text-2xl">HOMIFI</div>
                  <div className="text-xs tracking-wider">EVERY HOME MATTERS</div>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="absolute bottom-24 left-8 right-8">
              <h1 className="text-white text-4xl font-bold leading-tight">
                {image.title}
              </h1>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
      
  )
}

export default Carosel