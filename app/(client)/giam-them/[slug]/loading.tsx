import StarRating from "@/components/product/star-rating";

function CategorySkeleton() {
  return (
    <div className="col-span-2 sm:col-span-4">
      <div className="col-span-full container sm:my-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="col-span-1 bg-white shadow-md space-y-2 h-fit"
          >
            <div className="w-full aspect-square bg-gray-300"></div>
            <div className="px-2 sm:px-4 pb-2 flex flex-col space-y-2">
              <div className="h-4 bg-gray-300 w-full"></div>
              <div className="h-4 bg-gray-300 w-full"></div>
              <div className="flex gap-2 justify-between">
                <div className="h-4 w-16 bg-gray-300 "></div>
                <div className="h-4 w-16 bg-gray-300 "></div>
              </div>
              <div className="flex gap-2 justify-between">
                <StarRating rating={4.3} className="text-sm" />
                <div className="h-4 w-12 bg-gray-300 "></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategorySkeleton;
