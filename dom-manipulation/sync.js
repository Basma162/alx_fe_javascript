// Server sync functionality for ALX Dynamic Quote Generator

async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const serverQuotes = await response.json();
    return serverQuotes.map(q => ({ text: q.title, category: 'Server' }));
  } catch (error) {
    console.error("Error fetching server quotes:", error);
    return [];
  }
}

async function postQuoteToServer(quote) {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote)
  });
  return await response.json();
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  let merged = [...serverQuotes, ...localQuotes];
  localStorage.setItem("quotes", JSON.stringify(merged));
  
  if (typeof quotes !== 'undefined') {
    quotes = merged;
  }
  
  showSyncNotification("Quotes synced with server!");
}

function showSyncNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = "fixed";
  notification.style.bottom = "20px";
  notification.style.right = "20px";
  notification.style.background = "#4CAF50";
  notification.style.color = "white";
  notification.style.padding = "15px 20px";
  notification.style.borderRadius = "5px";
  notification.style.zIndex = "1000";
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

setInterval(syncQuotes, 30000);
