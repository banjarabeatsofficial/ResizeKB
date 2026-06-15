document.addEventListener("DOMContentLoaded", function () {
  const imageInput = document.getElementById("imageInput");
  const targetSize = document.getElementById("targetSize");
  const resizeBtn = document.getElementById("resizeBtn");
  const result = document.getElementById("result");
  const originalSize = document.getElementById("originalSize");
  const targetOutput = document.getElementById("targetOutput");
  const newSize = document.getElementById("newSize");
  const statusText = document.getElementById("statusText");
  const preview = document.getElementById("preview");
  const downloadBtn = document.getElementById("downloadBtn");

  if (!resizeBtn) {
    alert("Resize button not found.");
    return;
  }

  result.style.display = "none";

  resizeBtn.addEventListener("click", function () {
    const file = imageInput.files[0];

    if (!file) {
      alert("Please select an image first.");
      return;
    }

    const targetKB = Number(targetSize.value);

    originalSize.textContent = (file.size / 1024).toFixed(2) + " KB";

    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();

      img.onload = function () {
        resizeImage(img, targetKB);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });

  function resizeImage(img, targetKB) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    let width = img.width;
    let height = img.height;

    if (width > 1600) {
      height = Math.round((height * 1600) / width);
      width = 1600;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    let bestImage = "";
    let bestSize = 0;

    for (let quality = 0.95; quality >= 0.05; quality -= 0.02) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      const size = getDataUrlSize(dataUrl);

      if (size <= targetKB * 1024) {
        bestImage = dataUrl;
        bestSize = size;
        break;
      }
    }

    if (!bestImage) {
      alert("Image cannot be resized to this size. Try higher KB.");
      return;
    }

    preview.src = bestImage;
    downloadBtn.href = bestImage;
    downloadBtn.download = "resizekb-image.jpg";

    targetOutput.textContent = targetKB + " KB";
    newSize.textContent = (bestSize / 1024).toFixed(2) + " KB";
    statusText.textContent = "✅ Successfully resized under " + targetKB + "KB";

    result.style.display = "block";
  }

  function getDataUrlSize(dataUrl) {
    const base64 = dataUrl.split(",")[1];
    return Math.round((base64.length * 3) / 4);
  }
});
