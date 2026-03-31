/**
 * Safely set SVG content on an element by parsing it as XML first.
 * Only use with internally-generated SVG strings — never with user input.
 */
export function setSvgContent(container: HTMLElement, svgString: string): void {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    container.textContent = '[SVG render error]';
    return;
  }
  container.replaceChildren(doc.documentElement);
}

/**
 * Clear all children from an element safely.
 */
export function clearChildren(element: HTMLElement): void {
  element.replaceChildren();
}
