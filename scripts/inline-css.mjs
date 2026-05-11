/**
 * Post-build step: inline dist/widget.css into dist/widget.js.
 *
 * Vite's lib mode extracts CSS to a separate file even with
 * cssCodeSplit: false. For an embed-via-single-script-tag widget
 * we want exactly ONE artifact. This script reads the CSS, escapes
 * it for safe inclusion in a JS template literal, and prepends a
 * tiny IIFE to widget.js that injects a <style> tag at runtime.
 *
 * Net result: widget.css can be deleted, widget.js loads + styles
 * itself.
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
const jsPath = join(dist, "widget.js");
const cssPath = join(dist, "widget.css");

if (!existsSync(jsPath)) {
  console.error("widget.js not found at", jsPath);
  process.exit(1);
}
if (!existsSync(cssPath)) {
  console.log("no widget.css to inline — skipping");
  process.exit(0);
}

const css = readFileSync(cssPath, "utf8");
const js = readFileSync(jsPath, "utf8");

// JSON.stringify handles escaping for ALL safely (quotes, newlines,
// backslashes, unicode). Then drop the outer quotes by using it directly.
const escaped = JSON.stringify(css);

const injector = `(function(){var s=document.createElement('style');s.setAttribute('data-lensonline-widget','');s.textContent=${escaped};document.head.appendChild(s);})();`;

writeFileSync(jsPath, injector + "\n" + js, "utf8");
unlinkSync(cssPath);

const finalSize = readFileSync(jsPath).length;
console.log(`✓ inlined CSS (${css.length} bytes) into widget.js`);
console.log(`✓ deleted widget.css`);
console.log(`✓ final widget.js: ${(finalSize / 1024).toFixed(1)} KB`);
