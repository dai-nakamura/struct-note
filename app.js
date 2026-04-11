let items = [];
let recipe = [];

// --------------------
// 保存・読込
// --------------------
function saveData() {
  localStorage.setItem("items", JSON.stringify(items));
}

function loadData() {
  const data = localStorage.getItem("items");
  if (data) {
    items = JSON.parse(data);
  }
}

// --------------------
// 一覧表示
// --------------------
function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "card";

    const unit = item.unit || "g";
    const unitPrice = Number(item.unitPrice) || 0;

    div.innerHTML = `
      <div>
        <strong>${item.name}</strong> / ${item.subcategory}
        <button onclick="toggleDetail(${index})">詳細</button>
      </div>
      <div id="detail-${index}" style="display:none; margin-top:8px;">
        <div>ロット: ${item.lot}${unit}</div>
        <div>価格: ${item.price}円</div>
        <div>単価: ${unitPrice.toFixed(3)}円/${unit}</div>
        <button onclick="removeItem(${index})">削除</button>
      </div>
    `;

    list.appendChild(div);
  });

  updateMaterialSelect();
}
function toggleDetail(index) {
  const detail = document.getElementById(`detail-${index}`);
  if (!detail) return;

  detail.style.display = detail.style.display === "none" ? "block" : "none";
}

// --------------------
// JSON保存・読込
// --------------------
function exportData() {
  const blob = new Blob([JSON.stringify(items, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "cost-data.json";
  a.click();
}

function importData() {
  const file = document.getElementById("loadFile")?.files[0];
  if (!file) {
    alert("JSONファイルを選択してください");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      items = JSON.parse(e.target.result);
      saveData();
      render();
      alert("JSON読込完了");
    } catch (error) {
      alert("JSONの読込に失敗しました");
    }
  };
  reader.readAsText(file);
}

// --------------------
// 材料追加・削除
// --------------------
function removeItem(index) {
  items.splice(index, 1);
  saveData();
  render();
}

function addItem(item) {
  items.push(item);
  saveData();
  render();
}

function addManual() {
  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value.trim();
  const lot = Number(document.getElementById("lot").value);
  const price = Number(document.getElementById("price").value);
  const unit = document.getElementById("unit").value;
  const gPerUnit = Number(document.getElementById("gPerUnit").value) || null;

  if (!name || !category || !lot || !price) {
    alert("入力不足");
    return;
  }

  const unitPrice = price / lot;

  addItem({
    name,
    category,
    lot,
    price,
    unit,
    gPerUnit,
    unitPrice
  });

  document.getElementById("name").value = "";
  document.getElementById("category").value = "";
  document.getElementById("lot").value = "";
  document.getElementById("price").value = "";
  document.getElementById("gPerUnit").value = "";
}

// --------------------
// CSV取込
// --------------------
function importCSV() {
  const text = document.getElementById("csvInput").value.trim();

  if (!text) {
    alert("CSVを貼ってください");
    return;
  }

  parseCSV(text);
}

function importCSVFile() {
  const file = document.getElementById("csvFile").files[0];

  if (!file) {
    alert("ファイルを選択してください");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    parseCSV(e.target.result);
  };

  reader.readAsText(file);
}

function parseCSV(text) {
  const lines = text.trim().split("\n");

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");

    const name = cols[1]?.trim();
    const category = cols[2]?.trim();
    const price = Number(cols[4]);
    const lot = Number(cols[5]);
    const unit = cols[6]?.trim() || "g";
    const unitPrice = Number(cols[7]) || (lot ? price / lot : 0);
    const gPerUnit = cols[8] ? Number(cols[8]) : null;

    if (!name || !category || !price || !lot) continue;

    items.push({
      name,
      category,
      price,
      lot,
      unit,
      unitPrice,
      gPerUnit
    });
  }

  saveData();
  render();
  alert("CSV取り込み完了");
}

// --------------------
// レシピ
// --------------------
function updateSubCategoryFilter() {
  const filter = document.getElementById("filterSubCategory");
  if (!filter) return;

  const currentValue = filter.value;
  filter.innerHTML = `<option value="">すべての分類</option>`;

  const subcategories = [...new Set(items.map(item => item.subcategory).filter(Boolean))];

  categories.forEach(subcategory => {
    const option = document.createElement("option");
    option.value = subcategory;
    option.textContent = subcategory;
    filter.appendChild(option);
  });

  filter.value = currentValue;
}
function updateMaterialSelect() {
  const select = document.getElementById("materialSelect");
  const filter = document.getElementById("filterSubCategory");

  if (!select) return;

  const selectedSubCategory = filter ? filter.value : "";
  select.innerHTML = "";

  items
    .filter(item => !selectedSubCategory || item.subcategory === selectedSubCategory)
    .forEach((item, i) => {
      const option = document.createElement("option");
      option.value = items.indexOf(item);
      option.textContent = `${item.name} (${item.subcategory})`;
      select.appendChild(option);
    });

  updateCategoryFilter();
}
function toggleMaster() {
  const section = document.getElementById("masterSection");
  const button = document.getElementById("masterToggleBtn");

  if (!section || !button) return;

  const isHidden =
    section.style.display === "none" || section.style.display === "";

  section.style.display = isHidden ? "block" : "none";
  button.textContent = isHidden ? "原価マスター ▲" : "原価マスター ▼";
}
function addIngredient() {
  const index = Number(document.getElementById("materialSelect").value);
  const amount = Number(document.getElementById("useAmount").value);

  if (!amount) return;

  const item = items[index];
  if (!item) return;

  recipe.push({
    name: item.name,
    unitPrice: Number(item.unitPrice) || 0,
    amount
  });

  renderRecipe();
  document.getElementById("useAmount").value = "";
}

function renderRecipe() {
  const list = document.getElementById("recipeList");
  if (!list) return;

  list.innerHTML = "";

  recipe.forEach((r, i) => {
    const div = document.createElement("div");

    div.innerHTML = `
      ${r.name} - ${r.amount}g
      <button onclick="removeIngredient(${i})">削除</button>
    `;

    list.appendChild(div);
  });
}

function removeIngredient(i) {
  recipe.splice(i, 1);
  renderRecipe();
}

function calcCost() {
  let total = 0;

  recipe.forEach(r => {
    total += r.unitPrice * r.amount;
  });

  const yieldAmount = Number(document.getElementById("yield").value);
  const yieldUnit = document.getElementById("yieldUnit")?.value || "g";
  const sell = Number(document.getElementById("priceSell").value);

  const perUnit = yieldAmount ? total / yieldAmount : 0;

  let rate = 0;

  if (sell && yieldAmount) {
    if (yieldUnit === "個") {
      const totalSales = sell * yieldAmount;   // 1個300円 × 12個
      rate = (total / totalSales) * 100;
    } else {
      rate = (total / sell) * 100;
    }
  }

  document.getElementById("result").innerHTML = `
    合計原価: ${total.toFixed(2)}円<br>
    ${yieldUnit}単価: ${perUnit.toFixed(2)}円/${yieldUnit}<br>
    原価率: ${rate.toFixed(1)}%
  `;
}

// --------------------
// 初期化
// --------------------
loadData();
render();
updateSubCategoryFilter();
updateMaterialSelect();
