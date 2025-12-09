// ==== 1. 책 데이터 로드 & 렌더링 ====
const BOOKS_JSON_URL =
  "https://raw.githubusercontent.com/Divjason/finalProject_api/refs/heads/main/books_yes24.json";

const GOODS_JSON_URL =
  "https://raw.githubusercontent.com/Divjason/finalProject_api/refs/heads/main/goods_yes24.json";

let booksData = [];
let goodsData = [];

async function loadAllData() {
  const [booksRes, goodsRes] = await Promise.all([
    fetch(BOOKS_JSON_URL),
    fetch(GOODS_JSON_URL),
  ]);

  booksData = await booksRes.json();
  goodsData = await goodsRes.json();

  populateCategoryDropdown();

  renderBooks(booksData);
}

window.addEventListener("DOMContentLoaded", loadAllData);

function populateCategoryDropdown() {
  const categorySelect = document.getElementById("categorySelect");
  categorySelect.innerHTML = "";
  const categories = [
    ...new Set(booksData.map((b) => b.category).filter(Boolean)),
  ];
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

function renderBooks(books) {
  const listEl = document.getElementById("bookList");
  listEl.innerHTML = "";

  books.forEach((book) => {
    const card = document.createElement("article");
    card.className = "book-card";

    const url = book.detail_url || "#";

    card.innerHTML = `
      <a href="${url}" target="_blank" rel="noopener noreferrer">
        <img src="${book.thumbnail || ""}" alt="${book.title || ""}" />
      </a>
      <h3>
        <a href="${url}" target="_blank" rel="noopener noreferrer">
          ${book.title || "제목 없음"}
        </a>
      </h3>
      <p class="meta">${book.author || "저자 미상"} | ${
      book.publisher || ""
    }</p>
      <p class="meta">정가: ${book.list_price || "-"} / 판매가: ${
      book.sale_price || "-"
    }</p>
      <p class="meta">카테고리: ${book.category || ""} | 재고: ${
      book.stock || ""
    }</p>
      <button type="button">댓글 보기</button>
    `;

    const btn = card.querySelector("button");
    btn.addEventListener("click", () => openCommentSection(book));

    listEl.appendChild(card);
  });
}

function applyFilters() {
  const qRaw = document.getElementById("searchInput").value;
  const q = qRaw.trim().toLowerCase();
  const cat = document.getElementById("categorySelect").value;
  const filtered = booksData.filter((book) => {
    const inCategory = !cat || cat === "all" ? true : book.category === cat;
    const text = `${book.title || ""} ${book.author || ""} ${
      book.publisher || ""
    }`.toLowerCase();
    const inSearch = q ? text.includes(q) : true;
    return inCategory && inSearch;
  });
  renderBooks(filtered);
  if (q) {
    renderRelatedGoods(q, filtered);
  } else {
    const goodsContainer = document.getElementById("relatedGoods");
    if (goodsContainer) goodsContainer.innerHTML = "";
  }
}

document.getElementById("searchInput").addEventListener("input", applyFilters);
document
  .getElementById("categorySelect")
  .addEventListener("change", applyFilters);
