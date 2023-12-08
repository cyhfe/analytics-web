(async (window) => {
  // const endpoint = "http://localhost:4002/api/analytics";
  const endpoint = "https://analytics-server.icyh.me/api/analytics";
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
  const eventData = new Map();
  const positionData = new Set();
  //init visible refresh
  function handleEnter() {
    enterTimestamp = Date.now();
    prevPathname = location.pathname;

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
    updatePageViewData();
    const pageViewsDataToObj = Object.fromEntries(pageViewsData);
    // todo: event tracker
    // const eventDataToObj = eventData.size
    //   ? Object.fromEntries(eventData)
    //   : null;
    // const positionDataToObj = positionData.size
    //   ? Array.from(positionData)
    //   : null;
    pageViewsData.clear();
    eventData.clear();
    positionData.clear();

    const body = {
      pageViewsData: pageViewsDataToObj,
      sessionId,
      wid,
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

  function updatePageViewData() {
    const dt = Date.now() - enterTimestamp;
    pageViewsData.set(prevPathname, {
      count: (pageViewsData.get(prevPathname)?.count ?? 0) + 1,
      duration: (pageViewsData.get(prevPathname)?.duration ?? 0) + dt,
    });
  }

  // function update

  function handleBefore() {}

  function handleAfter() {
    if (prevPathname !== location.pathname) {
      updatePageViewData();
      enterTimestamp = Date.now();
      prevPathname = location.pathname;
    }
  }

  // 鼠标点击浏览器前进后退时触发
  window.addEventListener("popstate", () => {
    updatePageViewData();
    prevPathname = location.pathname;
    enterTimestamp = Date.now();
  });

  window.addEventListener("click", (e) => {
    if (!e.target || !e.target?.dataset) return;
    positionData.add({
      x: e.clientX,
      y: e.clientY,
    });
    for (const keyname in e.target.dataset) {
      if (keyname.startsWith("analytics")) {
        const key = keyname.slice(9);
        eventData.set(key, {
          count: (eventData.get(key)?.count ?? 0) + 1,
        });
      }
    }
  });
})(window);
