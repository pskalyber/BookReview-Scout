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

// HTML 파싱 (i.e., Yes24 or Aladin)
const parseHTML = (html, searchUrl, site) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // 리뷰 개수 추출
  let reviewCountSelectors;
  if (site==='yes24') {
    reviewCountSelectors = [
      ".rating_rv em",             // 목록형 1
      ".gd_reviewCount",           // 상세형 1
      "#spanReviewCount",          // 상세형 2
      ".review em",                // 목록형 2
      ".txC_blue"                  // 구형/기타
    ];
  }
  else if (site==='aladin') {
    reviewCountSelectors = [
      ".star_score + a",             // 목록형 1
    ];
  }
  else {
    alert('site is not defined.');
  }
  let reviewCount = "0";
  for (let s of reviewCountSelectors) {
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
  let ratingSelectors;
  if (site==='yes24') {
    ratingSelectors = [
      "#yesSchList > li > div > div.item_info > div.info_row.info_rating > span.rating_grade > em", // ISBN 검색 결과 페이지에서의 평점
      "#spanGdRating > a > em" // 특정 도서 상세 페이지에서의 평점
    ];
  }
  else if (site==='aladin') {
    ratingSelectors = [
      ".star_score", // ISBN 검색 결과 페이지에서의 평점
    ];
  }
  else {
    alert('site is not defined.');
  } 
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
  let linkElem;
  let detailUrl;
  if (site==='yes24') {
    linkElem = doc.querySelector(".gd_name");
    detailUrl = `https://www.yes24.com${linkElem?.getAttribute("href")}`;
  }
  else if (site==='aladin') {
    linkElem = doc.querySelector(".cover_area > a");
    detailUrl = linkElem?.getAttribute("href");
  }
  else {
    alert('site is not defined.');
  }
  return { count: reviewCount, rating: ratingScore, detailUrl };
};


// 메인 로직
const main = async () => {

  // 현재 도서 상세 페이지에서 해당 도서의 ISBN 추출
  const isbn = getISBN();
  if (!isbn) return;

  // 교보문고 상단 리뷰 영: 역타 서비스에서 해당 도서의 리뷰 개수와 리뷰 평점 정보를 추가할 공간
  const targetArea = document.querySelector("#contents > div.prod_detail_header > div > div.prod_detail_view_wrap > div.prod_detail_view_area > div:nth-child(1) > div > div.prod_review_box");
  if (!targetArea) {
    // 페이지 로딩 지연 대응: targetArea 못 찾으면 1초 후 재시도
    setTimeout(main, 1000);
    return;
  }

  // 중복 생성 방지: 이미 해당 영역에 이미 타 서비스의 리뷰 정보가 추가되었는지 확인
  if (document.getElementById("review-bridge-container")) return;

  // 버튼의 부모 요소(.prod_review_box)를 찾아 그 끝에 리뷰를 추가할 영역을 append
  const parentContainer = targetArea.parentElement;
  const bridgeContainer = document.createElement("div");
  bridgeContainer.id = "review-bridge-container";
  parentContainer.appendChild(bridgeContainer); 

  // 서점 사이트 정보
  const bookstoreSites = [
    {
      name: "yes24",
      searchUrl: `https://www.yes24.com/Product/Search?domain=BOOK&query=${isbn}`,
    },
    {
      name: "aladin",
      searchUrl: `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=${isbn}`,
    }
  ];

  // 각 서점 사이트 순회하며 정보 추출 후 업데이트
  for (const site of bookstoreSites) {
    const searchUrl = site.searchUrl;
    chrome.runtime.sendMessage({ action: "fetchHTML", url: site.searchUrl }, (response) => {
      if (response && response.success) {
        const data = parseHTML(response.html, searchUrl, site.name);
        
        const badge = document.createElement("a");
        badge.href = data.detailUrl;
        badge.target = "_blank";
        badge.className = 'review-badge';
        
        const starHtml = (data.rating !== "0") ? `<span class="rating-score">⭐ ${data.rating}</span>` : "";
        badge.innerHTML = `${site.name.charAt(0).toUpperCase()+site.name.slice(1)} 리뷰 <strong>${data.count}</strong>개 ${starHtml}`;
        
        bridgeContainer.appendChild(badge);
        bridgeContainer.appendChild(document.createElement("br"));
      }
    });
  }
};

setTimeout(main, 1200); // 로딩 시간을 조금 더 넉넉히 부여