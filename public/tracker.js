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

  const { screen, navigator, location, document, history } = window;

  const { wid } = document.currentScript.dataset;

  let sessionId;

  let enterTimestamp;

  let prevPathname;

  const pageViewsData = new Map();

  //init visible refresh
  function handleEnter() {
    enterTimestamp = Date.now();
    prevPathname = location.pathname;
    pageViewsData.clear();

    const body = {
      wid,
      sessionId,
    };
    const headers = {
      "Content-Type": "application/json",
    };
    window
      .fetch(endpoint + "/enter", {
        method: "POST",
        body: JSON.stringify(body),
        headers,
      })
      .then((res) =>
        res.text().then((text) => {
          sessionId = text;
        })
      );
  }

  // hidden refresh quit
  function handleLeave() {
    updaPageViewData();
    const pageViewsDataToObj = Object.fromEntries(pageViewsData);

    const body = {
      pageViewsData: pageViewsDataToObj,
      sessionId,
      screen: `${screen.width}x${screen.height}`,
      language: navigator.language,
      referrer: document.referrer,
    };
    const headers = {
      type: "application/json",
    };
    const blob = new Blob([JSON.stringify(body)], headers);
    navigator.sendBeacon(endpoint + "/leave", blob);
  }

  // 进入页面时触发 "enter"
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {
      handleEnter();
    }
  });

  // 页面切换,关闭时触发 "leave"
  document.addEventListener("visibilitychange", function logData() {
    if (document.visibilityState === "hidden") {
      handleLeave();
    }

    if (document.visibilityState === "visible") {
      handleEnter();
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

  function updaPageViewData() {
    const dt = Date.now() - enterTimestamp;
    pageViewsData.set(prevPathname, {
      count: (pageViewsData.get(prevPathname)?.count ?? 0) + 1,
      duration: (pageViewsData.get(prevPathname)?.duration ?? 0) + dt,
    });
  }

  function handleBefore() {}

  function handleAfter() {
    if (prevPathname !== location.pathname) {
      updaPageViewData();
      enterTimestamp = Date.now();
      prevPathname = location.pathname;
    }
  }

  // 鼠标点击浏览器前进后退时触发
  window.addEventListener("popstate", () => {
    updaPageViewData();
    prevPathname = location.pathname;
    enterTimestamp = Date.now();
  });
})(window);
