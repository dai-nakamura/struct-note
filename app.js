let items = JSON.parse(localStorage.getItem("items") || "[]");

function save() {
  localStorage.setItem("items", JSON.stringify(items));
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

function removeItem(index) {
  items.splice(index, 1);
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

render();
