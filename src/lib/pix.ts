// Gerador de PIX "Copia e Cola" (BR Code / EMV), 100% client-side — não depende de
// gateway de pagamento nenhum. Mesma lógica usada em PixGeneratorDialog.tsx (uso
// manual do admin), extraída aqui pra também ser usada no pedido do cliente
// (OrderDialog.tsx), sempre com o valor calculado a partir do preço real do produto.

const tlv = (id: string, value: string) => {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
};

const crc16 = (payload: string) => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

const stripDiacritics = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

export const buildPixPayload = ({
  key,
  amount,
  merchantName,
  city,
  description,
}: {
  key: string;
  amount: number;
  merchantName: string;
  city: string;
  description?: string;
}) => {
  const gui = tlv("00", "br.gov.bcb.pix");
  const keyTlv = tlv("01", key);
  const desc = description ? tlv("02", stripDiacritics(description).slice(0, 50)) : "";
  const merchantAccountInfo = tlv("26", gui + keyTlv + desc);

  const payloadFormat = tlv("00", "01");
  const merchantCategoryCode = tlv("52", "0000");
  const transactionCurrency = tlv("53", "986");
  const transactionAmount = amount > 0 ? tlv("54", amount.toFixed(2)) : "";
  const countryCode = tlv("58", "BR");
  const name = tlv("59", stripDiacritics(merchantName).slice(0, 25));
  const cityTlv = tlv("60", stripDiacritics(city).slice(0, 15).toUpperCase());
  const additionalData = tlv("62", tlv("05", "***"));

  const partial =
    payloadFormat +
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    name +
    cityTlv +
    additionalData +
    "6304";

  return partial + crc16(partial);
};

export const pixQrUrl = (payload: string) =>
  `https://quickchart.io/qr?size=320&margin=2&text=${encodeURIComponent(payload)}`;
