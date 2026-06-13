import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=720&fit=crop",
    title: "New Summer Collection",
    subtitle: "Discover the latest trends and styles for the season",
    cta: "Shop Now",
    align: "left" as const,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=720&fit=crop",
    title: "Premium Quality Products",
    subtitle: "Handpicked items curated just for you",
    cta: "Explore",
    align: "center" as const,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=720&fit=crop",
    title: "Exclusive Deals & Offers",
    subtitle: "Up to 50% off on selected items this week",
    cta: "View Deals",
    align: "right" as const,
  },
];

export function HeroBanner() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <section className="relative w-full">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[720px] w-full overflow-hidden">
                {/* Background Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40" />
                
                {/* Content */}
                <div className="relative z-10 flex h-full items-center">
                  <div
                    className={`container mx-auto px-6 md:px-12 ${
                      slide.align === "center"
                        ? "text-center"
                        : slide.align === "right"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    <div
                      className={`max-w-xl ${
                        slide.align === "center"
                          ? "mx-auto"
                          : slide.align === "right"
                          ? "ml-auto"
                          : ""
                      }`}
                    >
                      <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in">
                        {slide.title}
                      </h2>
                      <p className="mb-8 text-base text-white/90 sm:text-lg md:text-xl animate-fade-in">
                        {slide.subtitle}
                      </p>
                      <Button
                        size="lg"
                        className="group bg-white text-black hover:bg-white/90 animate-fade-in"
                      >
                        {slide.cta}
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 w-8 rounded-full transition-all hover:bg-white/80 ${
              index === current ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
