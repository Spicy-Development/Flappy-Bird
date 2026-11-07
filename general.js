function print(data) {
    var container = document.body;
    var element = document.createElement("div");
    element.textContent = data;
    container.appendChild(element);
}