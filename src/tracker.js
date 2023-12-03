let initialized;

const endpoint = "/api";
console.log(document.currentScript);
send();

const { webid } = document.currentScript.dataset;

console.log(webid);

document.addEventListener("readystatechange", () => {
  console.log("readyState", document.readyState);
  if (document.readyState === "complete" && !initialized) {
    init();
    initialized = true;
  }
});

function init() {
  send();
  initialized = true;
}

function send(payload, type = "event") {
  const headers = {
    "Content-Type": "application/json",
  };

  return fetch(endpoint, {
    method: "GET",
    body: JSON.stringify({ type, payload }),
    headers,
  })
    .then(() => {})
    .catch(() => {}); // no-op, gulp error
}
