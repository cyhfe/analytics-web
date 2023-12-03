let initialized;

document.addEventListener("readystatechange", () => {
  console.log("readyState", document.readyState);
  if (document.readyState === "complete" && !initialized) {
    init();
    initialized = true;
  }
});

function init() {
  track();
  initialized = true;
}
const track = (obj, data) => {
  // if (typeof obj === "string") {
  //   return send({
  //     ...getPayload(),
  //     name: obj,
  //     data: typeof data === "object" ? data : undefined,
  //   });
  // } else if (typeof obj === "object") {
  //   return send(obj);
  // } else if (typeof obj === "function") {
  //   return send(obj(getPayload()));
  // }
  // return send(getPayload());
};

function send(payload, type = "event") {
  const headers = {
    "Content-Type": "application/json",
  };
  if (typeof cache !== "undefined") {
    headers["x-umami-cache"] = cache;
  }
  return fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({ type, payload }),
    headers,
  })
    .then((res) => res.text())
    .then((text) => (cache = text))
    .catch(() => {}); // no-op, gulp error
}
