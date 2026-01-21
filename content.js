// 1. ISBN 추출 (더 정교하게 추출)
const getISBN = () => {
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  let isbn = "";
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.innerText);
      const obj = Array.isArray(data) ? data.find(item => item.isbn) : data;
      isbn = obj?.isbn || obj?.["@graph"]?.find(it => it.isbn)?.isbn;
    } catch (e) {}
  }
  if (!isbn) {
    isbn = document.querySelector('meta[property="books:isbn"]')?.content;
  }
  return isbn ? isbn.replace(/[^0-9]/g, "") : null;
};

// YES24 파싱 (목록형과 상세형 모두 대응)
const parseYES24 = (html, searchUrl) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // 리뷰 개수 추출
  const countSelectors = [
    ".rating_rv em",             // 목록형 1
    ".gd_reviewCount",           // 상세형 1
    "#spanReviewCount",          // 상세형 2
    ".review em",                // 목록형 2
    ".txC_blue"                  // 구형/기타
  ];
  let reviewCount = "0";
  for (let s of countSelectors) {
    const elem = doc.querySelector(s);
    if (elem && elem.innerText.trim() !== "") {
      const num = elem.innerText.replace(/[^0-9]/g, "");
      if (num && num !== "0") {
        reviewCount = num;
        break;
      }
    }
  }

  // 평점 추출
  const ratingSelectors = [
    "#yesSchList > li > div > div.item_info > div.info_row.info_rating > span.rating_grade > em", // ISBN 검색 결과 페이지에서의 평점
    "#spanGdRating > a > em" // 특정 도서 상세 페이지에서의 평점
  ];
  let ratingScore = "0";
  for (let s of ratingSelectors) {
    const elem = doc.querySelector(s);
    if (elem) {
      const score = elem.innerText.trim();
      if (score && score !== "0" && score !== "0.0") {
        ratingScore = score;
        break;
      }
    }
  }
  
  // 도서 상세 페이지 링크 추출
  const linkElem = doc.querySelector(".gd_name");
  const href = linkElem?.getAttribute("href");
  const detailUrl = href ? `https://www.yes24.com${href}` : searchUrl;
  return { count: reviewCount, rating: ratingScore, detailUrl };
};



// 메인 로직
const main = async () => {
  const isbn = getISBN();
  if (!isbn) return;

  const searchUrl = `https://www.yes24.com/Product/Search?domain=BOOK&query=${isbn}`;
  const targetArea = document.querySelector("#contents > div.prod_detail_header > div > div.prod_detail_view_wrap > div.prod_detail_view_area > div:nth-child(1) > div > div.prod_review_box");
  if (!targetArea) {
    // 페이지 로딩 지연 대응: 버튼을 못 찾으면 1초 후 재시도
    setTimeout(main, 1000);
    return;
  }

  // 중복 생성 방지
  if (document.getElementById("review-bridge-container")) return;

  // 버튼의 부모 요소(.prod_review_box)를 찾아 그 안에 삽입
  const parentContainer = targetArea.parentElement;
  const bridgeContainer = document.createElement("div");
  bridgeContainer.id = "review-bridge-container";
  parentContainer.appendChild(bridgeContainer); 

  chrome.runtime.sendMessage({ action: "fetchHTML", url: searchUrl }, (response) => {
    if (response && response.success) {
      const data = parseYES24(response.html, searchUrl);
      
      const badge = document.createElement("a");
      badge.href = data.detailUrl;
      badge.target = "_blank";
      badge.className = "yes24-review-badge";
      
      const starHtml = (data.rating !== "0") ? `<span class="rating-score">⭐ ${data.rating}</span>` : "";
      badge.innerHTML = `YES24 리뷰 <strong>${data.count}</strong>개 ${starHtml}`;
      
      bridgeContainer.appendChild(badge);
    }
  });
};

setTimeout(main, 1200); // 로딩 시간을 조금 더 넉넉히 부여