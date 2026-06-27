export default function makeMavka(pkgVersion: string, terminal: HTMLDivElement) {
  return new Mavka(pkgVersion, {
    print: (value: string, color?: string) => {
      const colorClass = `term-color-${color || "default"}`;
      terminal.innerHTML += `<span class="${colorClass}" style="white-space: pre-wrap;">${value.replaceAll("\n", "<br>")}</span>`;
    },
    readline: (callback: (value?: string) => void, prefix?: string) => {
      const rowEl = document.createElement("div");
      rowEl.className = "terminal-row";

      if (prefix) {
        const prefixEl = document.createElement("span");
        prefixEl.innerHTML = prefix.replaceAll("\n", "<br>");
        rowEl.appendChild(prefixEl);
      }

      const inputEl = document.createElement("input");
      inputEl.id = "input";
      rowEl.appendChild(inputEl);

      terminal.appendChild(rowEl);
      inputEl.focus();

      inputEl.addEventListener("keydown", function handleEnter(event) {
        if (event.key === "Enter") {
          const inputValue = inputEl.value;
          inputEl.removeEventListener("keydown", handleEnter);
          inputEl.removeAttribute("id");

          const textNode = document.createTextNode(inputValue);
          rowEl.replaceChild(textNode, inputEl);

          callback(inputValue);
        }
      });
    },
  });
}
