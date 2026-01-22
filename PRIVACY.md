# Privacy Policy for BookReview Scouter
**Last Updated: 2026-01-22**

**BookReview Scouter** (hereinafter referred to as "the Extension") values your privacy. This Privacy Policy explains how we handle your data across all supported bookstores (Kyobo, YES24, Aladin).

## 1. Data Collection and Usage
The Extension does **not** collect, store, or transmit any personally identifiable information (PII) such as names, emails, or browsing history to external servers.

The Extension operates strictly as follows:
* **Context-Aware Extraction:** When you visit a book detail page on any of the supported stores, the Extension identifies the site and extracts the book's ISBN.
* **Cross-Site Fetching:** The extracted ISBN is used to query public review data (rating count and score) from the other supported bookstores to provide a comparison.
* **Local Processing:** All data fetching and parsing occur within your browser. No data is sent to the developer or any third-party analytics servers.



## 2. Third-Party Services
The Extension interacts with the following third-party websites:
* **Kyobo Book Centre** (kyobobook.co.kr)
* **YES24** (yes24.com)
* **Aladin** (aladin.co.kr)

We do not control the privacy practices of these third-party services.

## 3. Permissions Justification
* `host_permissions`: Required to fetch public review data from the three bookstores mentioned above.
* `content_scripts`: Required to display the comparison badges directly on the bookstore's interface.

## 4. Contact
If you have any questions about this Privacy Policy, please contact the developer:
* **Developer:** Sangkeun Park
* **Research Lab:** User eXperience Computing (UXC) Lab
* **Email:** [교수님의 이메일 주소를 입력하세요]

---

# 개인정보처리방침 (Korean)

**BookReview Scouter** (이하 "본 확장 프로그램")은 사용자의 개인정보를 소중하게 생각합니다. 모든 지원 서점(교보문고, YES24, 알라딘)에서의 데이터 처리 방식을 다음과 같이 안내합니다.

## 1. 데이터 수집 및 이용
본 확장 프로그램은 사용자의 이름, 이메일, 브라우징 기록 등 어떠한 **개인 식별 정보(PII)도 수집, 저장, 또는 외부 서버로 전송하지 않습니다.**

데이터는 오직 다음과 같은 기술적 목적으로만 사용됩니다:
* **ISBN 식별:** 사용자가 지원 서점의 도서 상세 페이지에 접속할 때, 타 서점의 리뷰 정보를 조회하기 위해 해당 도서의 ISBN 정보만을 일시적으로 식별합니다.
* **교차 서점 조회:** 식별된 ISBN을 사용하여 현재 방문 중인 서점을 제외한 나머지 지원 서점의 공개된 평점 및 리뷰 정보를 실시간으로 조회합니다.
* **로컬 처리:** 모든 정보 조회 및 표시 과정은 사용자의 브라우저 내에서만 이루어지며, 외부로 데이터를 전송하지 않습니다.

## 2. 제3자 서비스 연동
본 확장 프로그램은 기능 수행을 위해 다음 웹사이트와 통신합니다:
* 교보문고 (kyobobook.co.kr)
* YES24 (yes24.com)
* 알라딘 (aladin.co.kr)

## 3. 권한 사용 안내
* `host_permissions`: 지원하는 3대 서점의 공개 데이터를 가져오기 위해 사용됩니다.
* `content_scripts`: 서점 웹페이지 내에 리뷰 비교 배지를 표시하기 위해 사용됩니다.

## 4. 문의하기
본 개인정보처리방침과 관련하여 문의사항이 있으신 경우 아래로 연락 주시기 바랍니다.
* **개발자:** 박상근
* **연구실:** 사용자경험컴퓨팅 (UXC) 연구실
* **이메일:** [교수님의 이메일 주소를 입력하세요]