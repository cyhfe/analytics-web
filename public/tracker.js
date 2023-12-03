(async (window) => {
  let initialized;

  const endpoint = "http://localhost:4002/api";
  const hook = (_this, method, before, after) => {
    const orig = _this[method];

    return (...args) => {
      before?.apply(null, args);
      const res = orig.apply(_this, args);
      after?.apply(null, args);
      return res;
    };
  };
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

  const { hostname, pathname, search } = location;

  let title = document.title;

  let currentUrl = `${pathname}${search}`;
  let currentreferrer = document.referrer;
  const { website } = document.currentScript.dataset;
  let currentPathname;

  function getPayload() {
    return {
      website,
      hostname: location.hostname,
      screen: { width, height },
      language,
      title,
      url: location.pathname,
      referrer: document.referrer,
    };
  }

  // 进入页面时触发 "enter"
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {
      console.log("readystatechange complete", location);
    }
  });

  // 页面切换,关闭时触发 "leave"
  document.addEventListener("visibilitychange", function logData() {
    if (document.visibilityState === "hidden") {
      console.log("leave visibilitychange", location);
      // navigator.sendBeacon(endpoint);
    }

    if (document.visibilityState === "visible") {
      console.log("enter visibilitychange", getPayload());
    }
  });

  // 命令式路由切换时触发 "leave"
  history.pushState = hook(history, "pushState", handleBefore, handleAfter);
  history.replaceState = hook(
    history,
    "replaceState",
    handleBefore,
    handleAfter
  );

  function handleBefore() {
    // send(getPayload());
    console.log("leave,pushState be", location.pathname);
  }

  function handleAfter() {
    // send(getPayload());
    currentPathname = location.pathname;
    console.log("leave,pushState af", location.pathname);
  }

  // 鼠标点击浏览器前进后退时触发
  window.addEventListener("popstate", async (e) => {
    // send(getPayload());
    console.log(currentPathname);
    currentPathname = location.pathname;
    console.log("popstate", location.pathname);
  });
})(window);
