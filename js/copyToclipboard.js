const copyBtn = document.getElementById("copyBtn");
const grid = document.getElementById("grid"); // your bingo grid

copyBtn.addEventListener("click", async () => {
  try {
    const canvas = await html2canvas(grid);
    const blob = await new Promise(resolve => canvas.toBlob(resolve));

    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);

    alert("Bingo board copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy:", err);
    alert("Sorry, your browser may not support image clipboard copy.");
  }
});
