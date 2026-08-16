export function enhanceImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const contrast = 45;
        const brightness = 15;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          for (let c = 0; c < 3; c++) {
            let value = data[i + c];
            value = factor * (value - 128) + 128 + brightness;
            data[i + c] = Math.max(0, Math.min(255, value));
          }
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(
          (blob) => {
            const enhancedFile = new File([blob], file.name, { type: "image/jpeg" });
            resolve(enhancedFile);
          },
          "image/jpeg",
          0.92
        );
      };
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}