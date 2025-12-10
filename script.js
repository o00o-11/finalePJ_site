// ==== 7. Firebase Auth ====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GithubAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQCLQtmS2aiJzxD4e7EsOXy7Ew89Hi7fM",
  authDomain: "finalproject-api-251209.firebaseapp.com",
  projectId: "finalproject-api-251209",
  storageBucket: "finalproject-api-251209.firebasestorage.app",
  messagingSenderId: "609885297100",
  appId: "1:609885297100:web:0d46714b58b9ba842f2569",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GithubAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const chatBox = document.getElementById("chatBox");

loginBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider);
});

logoutBtn.addEventListener("click", () => {
  signOut(auth).catch(console.error);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.textContent = `로그인 사용자: ${user.displayName || user.email}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    chatBox.style.display = "block";
  } else {
    userInfo.textContent = "로그인하지 않았습니다.";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    chatBox.style.display = "none";
  }
});

// ==== 8. Firebase Chat ====
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

// ==== 1. 책 & 굿즈 데이터 로드 & 렌더링 ====
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

// ==== 2. 브라우저 스캔 후 데이터 로드 및 렌더링 실행 ====
window.addEventListener("DOMContentLoaded", loadAllData);

// ==== 3. 카테고리 드롭다운 메뉴 생성 ====
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

// ==== 4. 책 정보 API 활용 화면 출력 ====
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

// ==== 5. 책 검색 필터 함수 ====
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

// ==== 6. 책 검색 필터 기능 실행 ====
document.getElementById("searchInput").addEventListener("input", applyFilters);
document
  .getElementById("categorySelect")
  .addEventListener("change", applyFilters);
