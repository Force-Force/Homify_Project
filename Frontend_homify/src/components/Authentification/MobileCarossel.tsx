import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
const MobileCarousel = () => {
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
        <div>
         {/* Mobile Header with Carousel */}
          <div className="lg:hidden mb-8">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-700 mb-6">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">back to website</span>
            </button>
          </div>
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6 shadow-lg">
                      {carouselImages.map((image, index) => (
                        <div
                          key={index}
                          className="absolute inset-0 transition-opacity duration-1000 bg-cover bg-center"
                          style={{
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${image.url}')`,
                            opacity: currentSlide === index ? 1 : 0
                          }}
                        >
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-white text-lg font-semibold leading-tight">
                              {image.title}
                            </p>
                          </div>
                        </div>
                      ))}
        
                      {/* Mobile Carousel Controls */}
                      <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
        
                      {/* Mobile Indicators */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                        {carouselImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 rounded-full transition-all ${
                              currentSlide === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>   
                  </div>
  )
}

export default MobileCarousel;