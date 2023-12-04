(async (window) => {
  const endpoint = "http://localhost:4002/api/analytics";
  const hook = (_this, method, before, after) => {
    const orig = _this[method];
    return (...args) => {
      before?.apply(null, args);
      const res = orig.apply(_this, args);
      after?.apply(null, args);
      return res;
    };
  };
  function send(type, payload) {
    const headers = {
      "Content-Type": "application/json",
    };
    return window.fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ type, payload }),
      headers,
    });
  }

  const { screen, navigator, location, document, history } = window;

  const { wid } = document.currentScript.dataset;

  let enterTimestamp;

  const pageViewsCount = new Map();

  //init visible refresh
  function handleEnter() {
    enterTimestamp = Date.now();
    const body = {
      wid,
    };
    const headers = {
      "Content-Type": "application/json",
    };
    window.fetch(endpoint + "/enter", {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });
  }

  function getPayload() {
    if (!enterTimestamp) {
      return;
    }
    const dt = Date.now() - enterTimestamp;
    return {
      duration: dt,
      wid,
      screen: `${screen.width}x${screen.height}`,
      language: navigator.language,
      referrer: document.referrer,
    };
  }

  // hidden refresh quit
  function handleLeave() {
    const payload = getPayload();
    if (!payload) return;
  }

  function handleRouterChange() {
    pageViewsCount.set(
      location.pathname,
      (pageViewsCount.get(location.pathname) || 0) + 1
    );
    // const views = {
    //   [pathname]: 1,
    // };
  }

  // 进入页面时触发 "enter"
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {
      console.log("readystatechange complete", location);
      handleEnter();
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
  window.addEventListener("popstate", () => {
    // send(getPayload());
    console.log(currentPathname);
    currentPathname = location.pathname;
    console.log("popstate", location.pathname);
  });
})(window);
