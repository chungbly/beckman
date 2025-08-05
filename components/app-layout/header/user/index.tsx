import { getCustomer } from "@/client/customer.client";
import { getUserId } from "@/lib/cookies";
import { CircleUserRound } from "lucide-react";
import LoginDialog from "../../login-form-dialog";
import LoggedUser from "./logged-user";

async function HeaderUser() {
  const userId = await getUserId();
  const res = userId ? await getCustomer(userId) : null;
  const customer = res?.data;

  if (customer) return <LoggedUser customer={customer} />;
  return (
    <LoginDialog>
      <div className="hidden sm:block p-4 cursor-pointer">
        <CircleUserRound className="w-6 h-6  text-white" />
      </div>
    </LoginDialog>
  );
}

export default HeaderUser;
