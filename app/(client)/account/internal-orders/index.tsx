import { getOrders } from "@/client/order.client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getUserId } from "@/lib/cookies";
import { Customer } from "@/types/customer";
import InternalOrderItem from "./item";

async function InternalOrders({ customer }: { customer: Customer }) {
  const userId = await getUserId();

  const resInternalOrders = userId
    ? await getOrders({
        customerIds: [userId],
      })
    : null;
  const internalOrders = resInternalOrders?.data || [];
  if (!internalOrders.length) return null;
  return (
    <div className="p-4 bg-white">
      <Accordion type="single" collapsible className="w-full">
        {internalOrders.map((internalOrder) => (
          <AccordionItem key={internalOrder._id} value={internalOrder.code}>
            <AccordionTrigger>
              <b>Mã hoá đơn: {internalOrder.code}</b>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <InternalOrderItem
                internalOrder={internalOrder}
                customer={customer}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default InternalOrders;
