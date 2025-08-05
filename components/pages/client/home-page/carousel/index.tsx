import { getGlobalConfig } from "@/lib/configs";
import { isMobileServer } from "@/lib/isMobileServer";
import { CarouselSlide } from "@/types/carousel";
import HomePageCarousel from "./carousel-client";

async function HomePageCarouselServer() {
  const configs = await getGlobalConfig();
  const slides = ((configs["SLIDES_CAROUSEL"] as CarouselSlide[]) || []).filter(
    (s) => s.active
  );
  const isMobile = await isMobileServer();
  return <HomePageCarousel slides={slides} isMobile={isMobile} />;
}

export default HomePageCarouselServer;
