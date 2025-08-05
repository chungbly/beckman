import FileManager from "@/components/file-manager";
import { getCurrentFolderPath } from "@/lib/cookies";
import {
  getFileInFolderQuery,
  getFolderTreeQuery,
  getSubFoldersQuery,
} from "@/query/cloudinary.query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

async function Page() {
  const queryClient = new QueryClient();
  const currentFolderPath = (await getCurrentFolderPath())?.value || "";

  await Promise.all([
    queryClient.prefetchQuery(getFolderTreeQuery),
    queryClient.prefetchQuery(getSubFoldersQuery(currentFolderPath)),
    queryClient.prefetchQuery(getFileInFolderQuery(currentFolderPath)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FileManager currentFolderPath={currentFolderPath} />
    </HydrationBoundary>
  );
}

export default Page;
