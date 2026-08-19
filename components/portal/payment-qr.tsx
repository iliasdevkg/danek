import QRCode from "qrcode";

/**
 * QR-код рисуется на сервере в SVG — ни одного килобайта клиентского JS
 * и ни одного внешнего сервиса генерации картинок. inline SVG к тому же
 * идеально резкий на любом экране, включая Retina.
 */
export async function PaymentQr({ payload }: { payload: string }) {
  const svg = await QRCode.toString(payload, {
    type: "svg",
    margin: 0,
    color: { dark: "#141312", light: "#00000000" },
  });

  return (
    <div
      className="border-rule bg-paper-raised aspect-square w-full max-w-52 rounded-md border p-4"
      // Строка сгенерирована библиотекой на сервере из проверенных данных школы,
      // не из пользовательского ввода — безопасно вставлять как разметку.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
