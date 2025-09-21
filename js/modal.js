// Modal button handlers
document.getElementById("keepBtn").addEventListener("click", () => {
  resetGame(true); // reuse numbers
  document.getElementById("restartModal").style.display = "none";
});

document.getElementById("clearBtn").addEventListener("click", () => {
  resetGame(false); // empty numbers
  document.getElementById("restartModal").style.display = "none";
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("restartModal").style.display = "none";
});
