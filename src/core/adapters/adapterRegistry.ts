import { ExchangeAdapter } from "./exchangeAdapter";
import { FlashAdapter } from "./flashAdapter";
import { JupiterAdapter } from "./jupiterAdapter";

const adapters: { [key: string]: ExchangeAdapter } = {
  flash: new FlashAdapter(),
  jupiter: new JupiterAdapter(),
};

export function getAdapter(exchange: string): ExchangeAdapter | null {
  return adapters[exchange.toLowerCase()] || adapters["flash"];
}
