import { getQuotations } from "../services/quotationService";

export const getNextQuotationNumber = async () => {
  const quotations = await getQuotations();

  if (!quotations || quotations.length === 0) {
    return 1001;
  }

  const maxNo = Math.max(
    ...quotations.map(q => Number(q.quotationNo || 0))
  );

  return maxNo + 1;
};