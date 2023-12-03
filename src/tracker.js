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

function send() {}
