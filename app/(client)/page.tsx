import HomePageCarouselServer from "@/components/pages/client/home-page/carousel";
import FlashDealContainer from "@/components/pages/client/home-page/flash-deal";
import HighlightCategories from "@/components/pages/client/home-page/hightlight-category";
import SubMenuHomePageContainer from "@/components/pages/client/home-page/sub-menu";
import VoucherZone from "@/components/pages/client/home-page/voucher-zone";

function HomePage() {
  return (
    <>
      <HomePageCarouselServer />
      <div className="container px-0 sm:px-2">
        <SubMenuHomePageContainer />
        <FlashDealContainer />
        <VoucherZone />
      </div>
      <HighlightCategories />
    </>
  );
}

export default HomePage;
