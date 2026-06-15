document.addEventListener("DOMContentLoaded", function () {
  const imageInput = document.getElementById("imageInput");
  const resizeBtn = document.getElementById("resizeBtn");
  const targetSize = document.getElementById("targetSize");
  const result = document.getElementById("result");
  const originalSize = document.getElementById("originalSize");
  const targetOutput = document.getElementById("targetOutput");
  const newSize = document.getElementById("newSize");
  const statusText = document.getElementById("statusText");
  const preview = document.getElementById("preview");
  const downloadBtn = document.getElementById("downloadBtn");

  let isDone = false;

  if (result) result.style.display = "none";

  resizeBtn.addEventListener("click", function () {
    isDone = false;

    const file = imageInput.files[0];

    if (!file) {
      alert("Please select image first");
      return;
    }

    const targetKB = Number(targetSize.value);

    originalSize.textContent = (file.size / 1024).toFixed(2) + " KB";
    targetOutput.textContent = targetKB + " KB";
    newSize.textContent = "";
    statusText.textContent = "Processing...";
    result.style.display = "block";

    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();

      img.onload = function () {
        processImage(img, targetKB);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });

  function processImage(img, targetKB) {
    let scale = 1;

    function tryCompress() {
      if (isDone) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = Math.max(80, Math.round(img.width * scale));
      canvas.height = Math.max(80, Math.round(img.height * scale));

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let quality = 0.92;

      function compressLoop() {
        if (isDone) return;

        canvas.toBlob(function (blob) {
          if (!blob || isDone) return;

          if (blob.size <= targetKB * 1024) {
            isDone = true;
            showResult(blob, targetKB);
            return;
          }

          quality -= 0.08;

          if (quality > 0.08) {
            compressLoop();
          } else {
            scale -= 0.12;

            if (scale > 0.08) {
              tryCompress();
            } else if (!isDone) {
              statusText.textContent = "❌ Try higher KB size.";
              alert("This image cannot be compressed to selected size. Try higher KB.");
            }
          }
        }, "image/jpeg", quality);
      }

      compressLoop();
    }

    tryCompress();
  }

  function showResult(blob, targetKB) {
    const url = URL.createObjectURL(blob);

    preview.src = url;
    downloadBtn.href = url;
    downloadBtn.download = "resizekb-under-" + targetKB + "kb.jpg";

    newSize.textContent = (blob.size / 1024).toFixed(2) + " KB";
    statusText.textContent = "✅ Successfully resized under " + targetKB + "KB";

    result.style.display = "block";
  }
});
