const statusEl = document.getElementById("status");
const tabGen = document.getElementById("tabGen");
const tabScan = document.getElementById("tabScan");
const genPanel = document.getElementById("genPanel");
const scanPanel = document.getElementById("scanPanel");
const textInput = document.getElementById("text");
const genBtn = document.getElementById("genBtn");
const qrBox = document.getElementById("qr");
const downloadBtn = document.getElementById("downloadBtn");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const fileInput = document.getElementById("fileInput");
const resultEl = document.getElementById("result");

let scanner = null;
let scanning = false;

statusEl.textContent = "JavaScript работает корректно.";
console.log("Web environment check completed.");

function showGenerator() {
  genPanel.hidden = false;
  scanPanel.hidden = true;
  tabGen.classList.add("active");
  tabScan.classList.remove("active");
  stopCamera();
}

function showScanner() {
  genPanel.hidden = true;
  scanPanel.hidden = false;
  tabGen.classList.remove("active");
  tabScan.classList.add("active");
}

tabGen.addEventListener("click", showGenerator);
tabScan.addEventListener("click", showScanner);

genBtn.addEventListener("click", function () {
  const text = textInput.value.trim();
  if (text === "") {
    alert("Введите текст или ссылку");
    return;
  }
  if (typeof QRCode === "undefined") {
    alert("Библиотека QRCode не загрузилась. Проверьте интернет.");
    return;
  }
  qrBox.innerHTML = "";
  new QRCode(qrBox, { text: text, width: 256, height: 256 });
  downloadBtn.hidden = false;
});

downloadBtn.addEventListener("click", function () {
  const canvas = qrBox.querySelector("canvas");
  const img = qrBox.querySelector("img");
  const link = document.createElement("a");
  link.download = "qr-code.png";
  if (canvas) {
    link.href = canvas.toDataURL("image/png");
  } else if (img) {
    link.href = img.src;
  } else {
    return;
  }
  link.click();
});

function getScanner() {
  if (typeof Html5Qrcode === "undefined") {
    throw new Error("Библиотека html5-qrcode не загрузилась");
  }
  if (!scanner) {
    scanner = new Html5Qrcode("reader");
  }
  return scanner;
}

function showResult(text) {
  const value = text.trim();
  if (/^https?:\/\//i.test(value)) {
    resultEl.textContent = "Открываю ссылку: " + value;
    setTimeout(function () {
      window.location.href = value;
    }, 1500);
  } else {
    resultEl.textContent = value;
  }
}

async function stopCamera() {
  if (scanner && scanning) {
    try {
      await scanner.stop();
      scanner.clear();
    } catch (e) {
      console.log(e);
    }
    scanning = false;
  }
  startBtn.hidden = false;
  stopBtn.hidden = true;
}

startBtn.addEventListener("click", async function () {
  try {
    await getScanner().start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 220 },
      function (decodedText) {
        stopCamera();
        showResult(decodedText);
      }
    );
    scanning = true;
    startBtn.hidden = true;
    stopBtn.hidden = false;
  } catch (e) {
    resultEl.textContent = "Не удалось включить камеру: " + e;
  }
});

stopBtn.addEventListener("click", stopCamera);

fileInput.addEventListener("change", async function (event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  try {
    const text = await getScanner().scanFile(file, false);
    showResult(text);
  } catch (e) {
    resultEl.textContent = "QR-код на картинке не найден";
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}