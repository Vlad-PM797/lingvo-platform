(function () {
  "use strict";

  const STORAGE_KEY = "lingvo_workbook_palette";
  const paletteOptions = new Set(["pastel", "vibrant", "monochrome"]);

  function applyPalette(name) {
    document.body.classList.remove("palette-pastel", "palette-vibrant", "palette-monochrome");
    const safe = paletteOptions.has(name) ? name : "pastel";
    document.body.classList.add(`palette-${safe}`);
    localStorage.setItem(STORAGE_KEY, safe);
    const select = document.getElementById("paletteSelect");
    if (select) select.value = safe;
  }

  function mountPaletteControl() {
    const host = document.querySelector(".sheet");
    if (!host) return;

    const row = document.createElement("div");
    row.className = "palette-row";

    const select = document.createElement("select");
    select.id = "paletteSelect";
    select.className = "palette-select";
    select.innerHTML = [
      "<option value=\"pastel\">Palette: Pastel</option>",
      "<option value=\"vibrant\">Palette: Vibrant</option>",
      "<option value=\"monochrome\">Palette: Monochrome</option>",
    ].join("");

    row.appendChild(select);
    host.insertBefore(row, host.firstChild);

    select.addEventListener("change", function () {
      applyPalette(select.value);
    });
  }

  mountPaletteControl();
  applyPalette(localStorage.getItem(STORAGE_KEY) || "pastel");
})();
