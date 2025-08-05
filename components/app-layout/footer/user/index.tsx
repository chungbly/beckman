import { getCustomer } from "@/client/customer.client";
import { getUserId } from "@/lib/cookies";
import { CircleUserRound } from "lucide-react";
import LoginDialog from "../../login-form-dialog";
import LoggedUser from "./logged-user";

async function ActionBarUser() {
  const userId = await getUserId();
  const res = userId ? await getCustomer(userId) : null;
  const customer = res?.data;

  if (customer) return <LoggedUser />;
  return (
    <LoginDialog>
      <div className="flex items-center justify-center p-2">
        <CircleUserRound className="w-6 h-6 " />
      </div>
    </LoginDialog>
  );
}

export default ActionBarUser;
