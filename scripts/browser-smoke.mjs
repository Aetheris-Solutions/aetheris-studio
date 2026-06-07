const targets = await fetch("http://127.0.0.1:9222/json/list").then((response) =>
  response.json(),
);
const target = targets.find((item) =>
  item.url.startsWith("http://127.0.0.1:4173/"),
);

if (!target) {
  throw new Error("Local Aetheris page was not found in Chrome.");
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 1;

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

function command(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Evaluation failed.");
  }
  return result.result.value;
}

await command("Runtime.enable");
await new Promise((resolve) => setTimeout(resolve, 800));

const before = await evaluate(`(() => {
  const menu = document.querySelector(".w-nav-menu");
  const button = document.querySelector(".w-nav-button");
  return {
    menuDisplay: getComputedStyle(menu).display,
    buttonDisplay: getComputedStyle(button).display,
    buttonClass: button.className,
    slideCount: document.querySelectorAll(".w-slider .w-slide").length
  };
})()`);

await evaluate(`document.querySelector(".w-nav-button").click()`);
await new Promise((resolve) => setTimeout(resolve, 500));

const after = await evaluate(`(() => {
  const menu = document.querySelector(".w-nav-menu");
  const button = document.querySelector(".w-nav-button");
  return {
    menuDisplay: getComputedStyle(menu).display,
    menuClass: menu.className,
    buttonClass: button.className,
    expanded: button.getAttribute("aria-expanded")
  };
})()`);

console.log(JSON.stringify({ before, after }, null, 2));

if (
  before.buttonDisplay === "none" ||
  before.slideCount !== 8 ||
  after.menuDisplay === "none" ||
  !after.buttonClass.includes("w--open")
) {
  throw new Error("Mobile interaction smoke test failed.");
}

socket.close();
