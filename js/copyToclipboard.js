document.addEventListener("DOMContentLoaded", () => {
  const copyBtn = document.getElementById("copyBtn"); // your button
  const grid = document.getElementById("grid");       // your bingo grid

  copyBtn?.addEventListener("click", async () => {
    try {
      const canvas = await html2canvas(grid);
      const blob = await new Promise(resolve => canvas.toBlob(resolve));

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        alert("Bingo board copied to clipboard!");
      } else {
        // Fallback: trigger download
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "bingo.png";
        link.click();
        alert("Clipboard not supported. Board downloaded instead.");
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Error while copying or downloading the board.");
    }
  });
});
