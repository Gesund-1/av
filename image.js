/* ============================================
   IMAGE HELPER — untuk Vercel
   ============================================ */
(function () {
  const THUMB_HEIGHT = 170;
  const OBJECT_FIT   = "cover";

  function buildThumbnail(berita, API_BASE) {
    let src = berita.gambar || "";

    if (!src) {
      src = "https://via.placeholder.com/600x300?text=No+Image";
    } else if (src.startsWith("/")) {
      src = API_BASE + src;
    }

    const tinggi = berita.gambar_tinggi || THUMB_HEIGHT;
    const judulEscaped = String(berita.judul || "").replace(/"/g, "&quot;");

    return `
      <img src="${src}"
           alt="${judulEscaped}"
           loading="lazy"
           style="width:100%;height:${tinggi}px;object-fit:${OBJECT_FIT};
                  display:block;background:#0f172a;"
           onerror="this.src='https://via.placeholder.com/600x300?text=No+Image'">
    `;
  }

  window.ImageHelper = {
    buildThumbnail: buildThumbnail,
    THUMB_HEIGHT: THUMB_HEIGHT
  };
})();
