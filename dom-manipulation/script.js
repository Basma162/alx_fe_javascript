let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  { text: "Knowledge is power.", category: "Wisdom" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const exportBtn = document.getElementById("exportBtn");

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const lastCategory = localStorage.getItem("lastCategory") || "all";
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = lastCategory;
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastCategory", selectedCategory);
  let filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();
  if (newText === "" || newCategory === "") {
    alert("Please fill in both fields!");
    return;
  }
  quotes.push({ text: newText, category: newCategory });
  saveQuotes();
  populateCategories();
  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(file);
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    return data.slice(0, 5).map(item => ({ text: item.title, category: "server" }));
  } catch (error) {
    console.error("Error fetching from server:", error);
    return [];
  }
}

async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
    let merged = [...serverQuotes, ...localQuotes];
    localStorage.setItem("quotes", JSON.stringify(merged));
    quotes = merged;
    populateCategories();
    filterQuotes();
    notifyUser("Quotes synced with server!");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

function notifyUser(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.background = "#fffa65";
  notification.style.padding = "10px";
  notification.style.margin = "10px 0";
  document.body.prepend(notification);
  setTimeout(() => notification.remove(), 3000);
}

newQuoteBtn.addEventListener("click", filterQuotes);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportQuotes);

populateCategories();
filterQuotes();

setInterval(syncQuotes, 30000);
