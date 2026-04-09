let items = JSON.parse(localStorage.getItem("items") || "[]");

function save() {
  localStorage.setItem("items", JSON.stringify(items));
}

function saveData() {
  localStorage.setItem("items", JSON.stringify(items));
}

function loadData() {
  const data = localStorage.getItem("items");
  if (data) {
    items = JSON.parse(data);
  }
}

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div>${item.name} / ${item.category}</div>
      <div>${item.unitPrice.toFixed(3)}円/g</div>
      <button onclick="removeItem(${index})">削除</button>
    `;

    list.appendChild(div);
  });
}
function exportData() {
  const blob = new Blob([JSON.stringify(items)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "cost-data.json";
  a.click();
}

function importData() {
  const file = document.getElementById("loadFile").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    items = JSON.parse(e.target.result);
    saveData();
    render();
  };
  reader.readAsText(file);
}

function removeItem(index) {
  items.splice(index, 1);
  saveData();
  save();
  render();
}

function addItem(item) {
  items.push(item);
  save();
  render();
}

function addManual() {
  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const lot = Number(document.getElementById("lot").value);
  const price = Number(document.getElementById("price").value);

  if (!name || !lot || !price) {
    alert("入力不足");
    return;
    saveData();
  }

  const unitPrice = price / lot;

  addItem({ name, category, lot, price, unitPrice });
}

function importCSV() {
  const text = document.getElementById("csvInput").value;
  parseCSV(text);
}

function importCSVFile() {
  const file = document.getElementById("csvFile").files[0];

  if (!file) {
    alert("ファイル選択してください");
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

    const name = cols[1];
    const category = cols[2];
    const price = Number(cols[4]);
    const lot = Number(cols[5]);

    if (!name || !price || !lot) continue;

    const unitPrice = price / lot;

    addItem({ name, category, price, lot, unitPrice });
  }
}
let recipe = [];

function updateMaterialSelect() {
  const select = document.getElementById("materialSelect");
  select.innerHTML = "";

  items.forEach((item, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = item.name;
    select.appendChild(option);
  });
}

function addIngredient() {
  const index = document.getElementById("materialSelect").value;
  const amount = Number(document.getElementById("useAmount").value);

  if (!amount) return;

  const item = items[index];

  recipe.push({
    name: item.name,
    unitPrice: item.unitPrice,
    amount
  });

  renderRecipe();
}

function renderRecipe() {
  const list = document.getElementById("recipeList");
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
  const yieldUnit = document.getElementById("yieldUnit").value;
  const sell = Number(document.getElementById("priceSell").value);

  let perUnit = 0;

  if (yieldUnit === "g") {
    perUnit = total / yieldAmount;
  } else {
    perUnit = total / yieldAmount; // 1個あたり原価
  }

  const rate = sell ? (total / sell) * 100 : 0;

  document.getElementById("result").innerHTML = `
    合計原価: ${total.toFixed(2)}円<br>
    ${yieldUnit}単価: ${perUnit.toFixed(2)}円/${yieldUnit}<br>
    原価率: ${rate.toFixed(1)}%
  `;
}

loadData();
render();
updateMaterialSelect();
