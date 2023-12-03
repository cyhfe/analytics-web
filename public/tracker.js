(async (window) => {
  let initialized;

  const endpoint = "http://localhost:4002/api";

  function send(payload = {}, type = "event") {
    const headers = {
      "Content-Type": "application/json",
    };

    // return window.fetch(endpoint, {
    //   method: "POST",
    //   body: JSON.stringify({ type, payload }),
    //   headers,
    // });
  }

  const {
    screen: { width, height },
    navigator: { language },
    location,
    document,
    history,
  } = window;

  // 进入页面时触发
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete" && !initialized) {
      init();
      initialized = true;
    }
  });

  // 页面切换,关闭时触发
  document.addEventListener("visibilitychange", function logData() {
    if (document.visibilityState === "hidden") {
      console.log("hidden");
      navigator.sendBeacon(endpoint);
    }
  });

  // 命令式路由切换时触发
  history.pushState = hook(history, "pushState", handlePush);
  history.replaceState = hook(history, "replaceState", handlePush);

  function handlePush() {
    send(getPayload());
  }

  // 鼠标点击浏览器前进后退时触发
  window.addEventListener("popstate", async () => {
    send(getPayload());
  });

  const { hostname, pathname, search } = location;

  let title = document.title;

  let currentUrl = `${pathname}${search}`;
  let currentreferrer = document.referrer;
  function getPayload() {
    return {
      website,
      hostname,
      screen: { width, height },
      language,
      title,
      url: currentUrl,
      referrer: currentreferrer,
    };
  }

  const { website } = document.currentScript.dataset;

  const hook = (_this, method, callback) => {
    const orig = _this[method];

    return (...args) => {
      callback.apply(null, args);

      return orig.apply(_this, args);
    };
  };

  async function init() {
    await send(getPayload());
    // await send(getPayload());
    initialized = true;
  }
})(window);
