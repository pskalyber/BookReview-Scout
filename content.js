const SITE_CONFIG = {
  kyobo: {
    name: "교보문고",
    urlPatterns: ["*://product.kyobobook.co.kr/detail/*"],
    searchUrl: (isbn) => `https://search.kyobobook.co.kr/search?keyword=${isbn}`,
    getISBN: () => {
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      if (jsonLd) {
        try {
          const data = JSON.parse(jsonLd.innerText);
          const product = Array.isArray(data) ? data.find(item => item.isbn) : data;
          const isbn = product?.isbn || product?.["@graph"]?.find(it => it.isbn)?.isbn;
          if (isbn) return isbn.replace(/[^0-9]/g, "");
        } catch (e) {
          console.error("BookReview Scouter: JSON-LD parsing error.", e);
        }
      }
      const isbnMeta = document.querySelector('meta[property="books:isbn"]')?.content;
      return isbnMeta ? isbnMeta.replace(/[^0-9]/g, "") : null;
    },
    getInjectionPoint: () => {
      return document.querySelector(".prod_detail_view_area .prod_review_box");
    },
    parseSearchPage: (html, searchUrl) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const firstResult = doc.querySelector(".prod_item");
      if (!firstResult) return { count: "0", rating: "0", detailUrl: searchUrl };
      
      const rating = firstResult.querySelector(".review_klover_box > .review_klover_text ")?.innerText.trim() || "0";
      const count = firstResult.querySelector(".review_klover_box > .review_desc")?.innerText.replace(/[^0-9]/g, "") || "0";
      const detailUrl = firstResult.querySelector("a.prod_info")?.href || searchUrl;
      return { count, rating, detailUrl };
    }
  },
  yes24: {
    name: "YES24",
    urlPatterns: ["*://www.yes24.com/product/goods/*"],
    searchUrl: (isbn) => `https://www.yes24.com/product/search?domain=book&query=${isbn}`,
    getISBN: () => {
      // 1. Try JSON-LD
      try {
        const jsonLd = document.querySelector('script[type="application/ld+json"]');
        if (jsonLd) {
          const data = JSON.parse(jsonLd.innerText);
          if (data.isbn) {
            const isbn = data.isbn.replace(/[^0-9]/g, "");
            if (isbn) return isbn;
          }
        }
      } catch (e) {}

      // 2. Try meta tags (og:barcode seems to be used by yes24)
      try {
        const metaIsbn = document.querySelector('meta[property="og:barcode"]')?.content;
        if (metaIsbn) {
            const isbn = metaIsbn.replace(/[^0-9]/g, "");
            if (isbn) return isbn;
        }
      } catch (e) {}

      // 3. Fallback to searching the table
      try {
        const ths = Array.from(document.querySelectorAll("#infoset_specific th"));
        const isbnTh = ths.find(th => th.innerText.trim().includes("ISBN"));
        if (isbnTh) {
          const td = isbnTh.nextElementSibling;
          if (td) {
            const isbn = td.innerText.match(/\d{10,13}/)?.[0];
            if (isbn) return isbn;
          }
        }
      } catch (e) {}

      return null;
    },
    getInjectionPoint: () => {
      return document.querySelector("#yDetailTopWrap > div.topColRgt > div.gd_infoTop > span.gd_ratingArea");
    },
    parseSearchPage: (html, searchUrl) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const hasNoResult = doc.querySelector(".sch_rslt_list")?.innerText.includes("검색결과가 없습니다.");
      if (hasNoResult) return { count: "0", rating: "0", detailUrl: searchUrl };

      const firstResult = doc.querySelector("#yesSchList li:first-child");
      if (!firstResult) return { count: "0", rating: "0", detailUrl: searchUrl };

      const rating = firstResult.querySelector(".rating_grade em")?.innerText.trim() || "0";
      const countText = firstResult.querySelector(".info_rating .txC_blue")?.innerText || "";
      const count = countText.replace(/[^0-9]/g, "") || "0";
      const detailUrl = "https://www.yes24.com" + (firstResult.querySelector(".gd_name")?.getAttribute("href") || "");
      
      return { count, rating, detailUrl };
    }
  },
  aladin: {
    name: "알라딘",
    urlPatterns: ["*://www.aladin.co.kr/shop/wproduct.aspx*"],
    searchUrl: (isbn) => `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=${isbn}`,
    getISBN: () => {
      // 1. Try JSON-LD
      try {
        const jsonLdElement = document.querySelector('script[type="application/ld+json"]');
        if (jsonLdElement) {
          const jsonLd = JSON.parse(jsonLdElement.innerText);
          const graph = jsonLd['@graph'] || [jsonLd];
          for (const item of graph) {
            if ((item['@type'] === 'Book' || item['@type'] === 'Product') && item.isbn) {
              const isbn = item.isbn.replace(/[^0-9]/g, "");
              if (isbn) return isbn;
            }
          }
        }
      } catch (e) {
        console.warn("BookReview Scouter: Could not parse JSON-LD on Aladin.", e);
      }
      
      // 2. Try meta tags
      try {
          let metaIsbn = document.querySelector('meta[property="books:isbn"]')?.content;
          if (!metaIsbn) {
            metaIsbn = document.querySelector('meta[property="og:barcode"]')?.content;
          }
          if (metaIsbn) {
              const isbn = metaIsbn.replace(/[^0-9]/g, "");
              if (isbn) return isbn;
          }
      } catch(e) {}

      // 3. Fallback to searching the table
      try {
        const listItems = document.querySelectorAll(".conts_info_list li");
        const isbnLi = [...listItems].find(item => item.innerText.includes("ISBN"));
        if(isbnLi) {
            const isbn = isbnLi.innerText.match(/\d{10,13}/)?.[0];
            if (isbn) return isbn;
        }
      } catch(e) { console.error("BookReview Scouter: ISBN parsing error on Aladin.", e); }

      return null;
    },
    getInjectionPoint: () => {
      // 리뷰 섹션 하단에 임시로 추가
      const reviewSection = document.querySelector("div.info_list.Ere_fs15.Ere_ht18");
      if (reviewSection) return reviewSection;
      return document.querySelector(".Ere_prod_starwrap"); // 대체 위치
    },
    parseSearchPage: (html, searchUrl) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const firstResult = doc.querySelector(".ss_book_box");
      if (!firstResult) return { count: "0", rating: "0", detailUrl: searchUrl };

      const rating = firstResult.querySelector(".star_score")?.innerText.trim() || "0";
      
      const countEl = firstResult.querySelector(".star_score + a");
      const count = countEl ? countEl.innerText.replace(/[^0-9]/g, "") : "0";
      
      const detailUrl = firstResult.querySelector(".cover_area > a")?.href || searchUrl;

      return { count, rating, detailUrl };
    }
  }
};

const main = async () => {
  const currentUrl = window.location.href;
  let currentSiteKey = null;

  for (const key in SITE_CONFIG) {
    const site = SITE_CONFIG[key];
    const isCurrentSite = site.urlPatterns.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*?'));
        return regex.test(currentUrl);
    });
    if (isCurrentSite) {
      currentSiteKey = key;
      break;
    }
  }

  if (!currentSiteKey) {
    return;
  }

  const currentSite = SITE_CONFIG[currentSiteKey];
  const isbn = currentSite.getISBN();

  if (!isbn) {
    console.error("BookReview Scouter: ISBN not found on this page.");
    return;
  }

  const injectionPoint = currentSite.getInjectionPoint();
  if (!injectionPoint) {
    setTimeout(main, 1000); // 페이지 로딩 지연을 고려하여 1초 후 재시도
    return;
  }
  
  if (document.getElementById("review-bridge-container")) return;

  const container = document.createElement("div");
  container.id = "review-bridge-container";
  
  // 교보문고는 기존 구조를 유지하고, 다른 사이트들은 하단에 추가합니다.
  if (currentSiteKey === 'kyobo') {
      const parentContainer = injectionPoint.parentElement;
      parentContainer.appendChild(container);
  } else if (currentSiteKey === 'aladin') {
      injectionPoint.appendChild(container);
  } else {
      injectionPoint.parentNode.insertBefore(container, injectionPoint.nextSibling);
  }

  const sitesToFetch = Object.keys(SITE_CONFIG).filter(key => key !== currentSiteKey);

  for (const siteKey of sitesToFetch) {
    const siteToParse = SITE_CONFIG[siteKey];
    const searchUrl = siteToParse.searchUrl(isbn);
    
    chrome.runtime.sendMessage({ action: "fetchHTML", url: searchUrl }, (response) => {
      if (response && response.success) {
        const data = siteToParse.parseSearchPage(response.html, searchUrl);
        
        const badge = document.createElement("a");
        badge.href = data.detailUrl;
        badge.target = "_blank";
        badge.className = 'review-badge';
        
        const starHtml = (data.rating !== "0" && data.rating !== "0.0") ? `<span class="rating-score">⭐ ${data.rating}</span>` : "";
        badge.innerHTML = `${siteToParse.name} 리뷰 <strong>${data.count}</strong>개 ${starHtml}`;
        
        container.appendChild(badge);
      } else if (response && !response.success) {
        console.error(`BookReview Scouter: Failed to fetch from ${siteToParse.name}.`, response.error);
      }
    });
  }
};

// 페이지 로딩이 완료된 후 실행되도록 지연 시간을 줍니다.
setTimeout(main, 1500);
