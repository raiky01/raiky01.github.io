self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open("cordelia-cache").then(cache=>{
      return cache.addAll(["./","./index.html"]);
    })
  );
});