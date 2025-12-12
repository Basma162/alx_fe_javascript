let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe in yourself", category: "motivation" },
  { text: "Dream big, work hard", category: "motivation" },
  { text: "Life is short, smile while you can", category: "life" }
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

const quoteDisplay = document.getElementById("quoteDisplay");

document.getElementById("newQuoteBtn").addEventListener("click", () => {
  const r = Math.floor(Math.random() * quotes.length);
  const q = quotes[r];
  quoteDisplay.innerText = q.text;
  sessionStorage.setItem("lastViewedQuote", q.text);
});

function addQuote() {
  const input = document.getElementById("quoteInput");
  if (input.value.trim() === "") return;
  quotes.push({ text: input.value, category: "custom" });
  saveQuotes();
  input.value = "";
  alert("Quote added!");
}

function exportToJson() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

function fetchQuotesFromServer() {
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(data => {
      return data.slice(0, 5).map(item => ({ text: item.title, category: "server" }));
    });
}

function postQuoteToServer(quote) {
  return fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(quote)
  }).then(response => response.json());
}

function syncQuotes() {
  fetchQuotesFromServer().then(serverQuotes => {
    let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
    let merged = [...serverQuotes, ...localQuotes];
    localStorage.setItem("quotes", JSON.stringify(merged));
    quotes = merged;
    alert("Quotes synced with server!");
  });
}

setInterval(syncQuotes, 30000);
