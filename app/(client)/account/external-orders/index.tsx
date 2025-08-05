import { getExternalOrders } from "@/client/external-order.client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getUserId } from "@/lib/cookies";
import { Customer } from "@/types/customer";
import ExternalOrderItem from "./item";

async function ExternalOrders({ customer }: { customer: Customer }) {
  const userId = await getUserId();

  const resExternalOrders = userId
    ? await getExternalOrders({
        customerIds: [userId],
      })
    : null;
  const externalOrders = resExternalOrders?.data || [];
  if (!externalOrders.length) return null;
  return (
    <div className="">
      <h1 className="text-2xl font-bold my-4">Đơn hàng của bạn</h1>
      <div className="p-4 bg-white">
        <Accordion type="single" collapsible className="w-full">
          {externalOrders.map((externalOrder) => (
            <AccordionItem key={externalOrder._id} value={externalOrder.code}>
              <AccordionTrigger>
                <b>Mã hoá đơn: {externalOrder.code}</b>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <ExternalOrderItem
                  externalOrder={externalOrder}
                  customer={customer}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

export default ExternalOrders;
