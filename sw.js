const CACHE_NAME = "kyou-yaru-v1.4.0";
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then((response) => {
        if (!response || response.status !== 200) return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

/* --- 通知（ベストエフォート）: ページ側がIndexedDBに書いた「今日の残り件数」だけを読む。
   localStorageはSWから読めないため、タスクの中身はここでは一切扱わない。 --- */
function readNotifyDigest() {
  return new Promise((resolve) => {
    let req;
    try { req = indexedDB.open("kyouyaru-notify", 1); } catch (_) { resolve(null); return; }
    req.onupgradeneeded = () => { req.result.createObjectStore("digest"); };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction("digest", "readonly");
      const getReq = tx.objectStore("digest").get("today");
      getReq.onsuccess = () => { resolve(getReq.result || null); db.close(); };
      getReq.onerror = () => { resolve(null); db.close(); };
    };
    req.onerror = () => resolve(null);
  });
}

self.addEventListener("periodicsync", (event) => {
  if (event.tag !== "kyou-yaru-daily-check") return;
  event.waitUntil(
    readNotifyDigest().then((digest) => {
      if (!digest || !(digest.pending > 0)) return;
      return self.registration.showNotification("きょうやる", {
        body: `今日のタスクが${digest.pending}件残っています`,
        icon: "icons/icon-192.png",
        badge: "icons/icon-192.png",
        tag: "kyou-yaru-daily-" + digest.dateKey,
      });
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((list) => {
      for (const c of list) if ("focus" in c) return c.focus();
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
