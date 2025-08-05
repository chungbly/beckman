import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2, Save } from "lucide-react";

const SumbitButton = ({
  isDirty,
  handleSubmit,
}: {
  isDirty: boolean;
  handleSubmit: () => Promise<void>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Button
      disabled={!isDirty || isLoading}
      onClick={async () => {
        setIsLoading(true);
        await handleSubmit();
        setIsLoading(false);
      }}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      Lưu thay đổi
    </Button>
  );
};
export default SumbitButton;