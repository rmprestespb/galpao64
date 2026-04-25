import { useMemo, useState } from "react";
import { Copy, QrCode, Download, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ===== Helpers BR Code (PIX Copia e Cola) =====
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

const stripDiacritics = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const buildPixPayload = ({
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

export function PixGeneratorDialog() {
  const [open, setOpen] = useState(false);
  const [pixKey, setPixKey] = useState(
    () => localStorage.getItem("pix_key") || ""
  );
  const [merchantName, setMerchantName] = useState(
    () => localStorage.getItem("pix_name") || "Robson Galpao 64"
  );
  const [city, setCity] = useState(
    () => localStorage.getItem("pix_city") || "PATO BRANCO"
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const amountNumber = useMemo(() => {
    const n = parseFloat(amount.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const payload = useMemo(() => {
    if (!pixKey.trim() || !merchantName.trim() || !city.trim()) return "";
    try {
      return buildPixPayload({
        key: pixKey.trim(),
        amount: amountNumber,
        merchantName: merchantName.trim(),
        city: city.trim(),
        description: description.trim() || undefined,
      });
    } catch {
      return "";
    }
  }, [pixKey, merchantName, city, amountNumber, description]);

  const qrUrl = payload
    ? `https://quickchart.io/qr?size=320&margin=2&text=${encodeURIComponent(
        payload
      )}`
    : "";

  const persist = () => {
    localStorage.setItem("pix_key", pixKey);
    localStorage.setItem("pix_name", merchantName);
    localStorage.setItem("pix_city", city);
  };

  const handleCopy = async () => {
    if (!payload) return;
    persist();
    await navigator.clipboard.writeText(payload);
    toast.success("PIX Copia e Cola copiado!");
  };

  const handleDownload = async () => {
    if (!qrUrl) return;
    persist();
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pix-${amountNumber.toFixed(2)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao baixar QR Code");
    }
  };

  const handleSendWhats = () => {
    if (!payload) return;
    persist();
    const valorTxt = amountNumber > 0
      ? `R$ ${amountNumber.toFixed(2).replace(".", ",")}`
      : "valor combinado";
    const msg = `*PIX para reserva${description ? " - " + description : ""}*\n\nValor: ${valorTxt}\nChave: ${pixKey}\nFavorecido: ${merchantName}\n\n*PIX Copia e Cola:*\n${payload}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-accent/40 text-accent hover:bg-accent/10"
        >
          <QrCode className="h-4 w-4" /> PIX
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wider">
            Gerar Comprovante PIX
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Chave PIX *</Label>
              <Input
                placeholder="CPF, e-mail, telefone ou aleatória"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Favorecido *</Label>
              <Input
                placeholder="Nome do recebedor"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                maxLength={25}
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade *</Label>
              <Input
                placeholder="Cidade do recebedor"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={15}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 250,00 (opcional)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Honda NSX #42"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={50}
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-start gap-3 rounded-lg border border-border bg-muted/20 p-4">
            {qrUrl ? (
              <>
                <img
                  src={qrUrl}
                  alt="QR Code PIX"
                  className="h-56 w-56 rounded bg-white p-2"
                />
                <p className="text-center text-sm font-bold text-accent">
                  {amountNumber > 0
                    ? `R$ ${amountNumber.toFixed(2).replace(".", ",")}`
                    : "Sem valor fixo"}
                </p>
                <div className="flex w-full flex-col gap-2">
                  <Button onClick={handleCopy} size="sm" className="w-full">
                    <Copy className="h-4 w-4" /> Copiar Copia e Cola
                  </Button>
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4" /> Baixar QR Code
                  </Button>
                  <Button
                    onClick={handleSendWhats}
                    size="sm"
                    variant="outline"
                    className="w-full border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <MessageCircle className="h-4 w-4" /> Enviar no WhatsApp
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded border border-dashed border-border text-center text-xs text-muted-foreground">
                Preencha chave, favorecido e cidade para gerar o QR Code
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}