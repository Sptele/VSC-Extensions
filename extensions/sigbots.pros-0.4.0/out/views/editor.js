"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProsProjectEditorProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const nonce_1 = require("./nonce");
class ProsProjectEditorProvider {
    constructor(context) {
        this.context = context;
    }
    static register(context) {
        const provider = new ProsProjectEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ProsProjectEditorProvider.viewType, provider);
        return providerRegistration;
    }
    resolveCustomTextEditor(document, webviewPanel, _token) {
        return __awaiter(this, void 0, void 0, function* () {
            webviewPanel.webview.options = {
                enableScripts: true,
            };
            webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
            function updateWebview() {
                webviewPanel.webview.postMessage({
                    type: "update",
                    text: document.getText(),
                });
            }
            // Hook up event handlers so that we can synchronize the webview with the text document.
            //
            // The text document acts as our model, so we have to sync change in the document to our
            // editor and sync changes in the editor back to the document.
            //
            // Remember that a single text document can also be shared between multiple custom
            // editors (this happens for example when you split a custom editor)
            const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
                if (e.document.uri.toString() === document.uri.toString()) {
                    updateWebview();
                }
            });
            // Make sure we get rid of the listener when our editor is closed.
            webviewPanel.onDidDispose(() => {
                changeDocumentSubscription.dispose();
            });
            // Receive message from the webview.
            webviewPanel.webview.onDidReceiveMessage((e) => {
                switch (e.type) {
                    case "setSlot":
                        this.setSlot(document, e);
                        return;
                    case "setName":
                        this.setName(document, e);
                        return;
                    case "setDesc":
                        this.setDesc(document, e);
                        return;
                    case "setIcon":
                        this.setIcon(document, e);
                        return;
                    case "setAfter":
                        this.setAfter(document, e);
                        return;
                }
            });
            updateWebview();
        });
    }
    getHtmlForWebview(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "projectPros.js"));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "reset.css"));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "vscode.css"));
        const icons = fs.readdirSync(vscode.Uri.joinPath(this.context.extensionUri, "media", "icons").fsPath);
        var usable_icons = [];
        for (var i of icons) {
            i = i.replace(".png", "");
            usable_icons.push(i);
        }
        const nonce = nonce_1.getNonce();
        // TODO: run after upload option?
        // TODO: just need to get the editor writing to the document now
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <link href="${styleResetUri}" rel="stylesheet" />
				<link href="${styleVSCodeUri}" rel="stylesheet" />
      </head>
      <body>
        <div class="settings-group-title-label settings-row-inner-container settings-group-level-1 settings-group-first">
          PROS Project Settings
        </div>

        <div class="setting-item-contents settings-row-inner-container">
          <div class="setting-item-title">
            <div class="setting-item-cat-label-container">
              <span class="setting-item-category" title="files.autoSave">
                Upload: 
              </span>
              <span class="setting-item-label" title="files.autoSave">
                Project Name
              </span>
            </div>
          </div>
          <div class="setting-item-description">
            <div class="setting-item-markdown">
              <p>
                This shows as the program's name on the brain when uploaded.
              </p>
            </div>
          </div>
          <div class="setting-item-value">
            <div class="setting-item-control">
              <div class="monaco-inputbox" style="background-color: rgb(60, 60, 60); color: rgb(204, 204, 204);">
                <div class="ibwrapper">
                  <input id="projectName" class="input setting-control-focus-target" autocorrect="off" autocapitalize="off" spellcheck="false" type="text" wrap="off" tabindex="-1" data-focusable="true" style="background-color: inherit; color: rgb(204, 204, 204);">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="setting-item-contents settings-row-inner-container">
          <div class="setting-item-title">
            <div class="setting-item-cat-label-container">
              <span class="setting-item-category" title="files.autoSave">
                Upload: 
              </span>
              <span class="setting-item-label" title="files.autoSave">
                Project Description
              </span>
            </div>
          </div>
          <div class="setting-item-description">
            <div class="setting-item-markdown">
              <p>
                This shows as the program's description on the brain when uploaded.
              </p>
            </div>
          </div>
          <div class="setting-item-value">
            <div class="setting-item-control">
              <div class="monaco-inputbox" style="background-color: rgb(60, 60, 60); color: rgb(204, 204, 204);">
                <div class="ibwrapper">
                  <input id="projectDesc" class="input setting-control-focus-target" autocorrect="off" autocapitalize="off" spellcheck="false" type="text" wrap="off" tabindex="-1" data-focusable="true" style="background-color: inherit; color: rgb(204, 204, 204);">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="setting-item-contents settings-row-inner-container">
          <div class="setting-item-title">
            <div class="setting-item-cat-label-container">
              <span class="setting-item-category" title="files.autoSave">
                Upload: 
              </span>
              <span class="setting-item-label" title="files.autoSave">
                Program Slot
              </span>
            </div>
          </div>
          <div class="setting-item-description">
            <div class="setting-item-markdown">
              <p>
                Set the Program Slot number that this project will be uploaded into by default on the V5 brain.
              </p>
            </div>
          </div>
          <div class="setting-item-value">
            <div class="setting-item-control select-container">
              <select id="slotSelection" class="monaco-select-box monaco-select-box-dropdown-padding setting-control-focus-target" tabindex="-1" title="off" style="background-color: rgb(60, 60, 60); color: rgb(240, 240, 240); border-color: rgb(60, 60, 60);" data-focusable="true">
                ${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<option value="${i}">${i}</option>`)}
              </select>
            </div>
          </div>
        </div>

        <div class="setting-item-contents settings-row-inner-container">
          <div class="setting-item-title">
            <div class="setting-item-cat-label-container">
              <span class="setting-item-category" title="files.autoSave">
                Upload: 
              </span>
              <span class="setting-item-label" title="files.autoSave">
                Program Icon
              </span>
            </div>
          </div>
          <div class="setting-item-description">
            <div class="setting-item-markdown">
              <p>
                Set the Program Icon do be displayed on the V5 Brain.
              </p>
            </div>
          </div>
          <div class="setting-item-value">
            <div class="setting-item-control select-container">
              <select id="iconSelection" class="monaco-select-box monaco-select-box-dropdown-padding setting-control-focus-target" tabindex="-1" title="off" style="background-color: rgb(60, 60, 60); color: rgb(240, 240, 240); border-color: rgb(60, 60, 60);" data-focusable="true">
              ${usable_icons.map((i) => `<option value="${i}">${i == "pros" ? i.toUpperCase() : i.charAt(0).toUpperCase() + i.slice(1)}</option>`)}
              </select>
            </div>
          </div>
          <img id="iconPreview" style="width: 87px; height: 87px; object-fit: contain;"/>
        </div>

        <div class="setting-item-contents settings-row-inner-container">
          <div class="setting-item-title">
            <div class="setting-item-cat-label-container">
              <span class="setting-item-category" title="files.autoSave">
                Upload: 
              </span>
              <span class="setting-item-label" title="files.autoSave">
                Action After Upload
              </span>
            </div>
          </div>
          <div class="setting-item-description">
            <div class="setting-item-markdown">
              <p>
                Set what the V5 Brain does after uploading the project.
              </p>
            </div>
          </div>
          <div class="setting-item-value">
            <div class="setting-item-control select-container">
              <select id="runafter" class="monaco-select-box monaco-select-box-dropdown-padding setting-control-focus-target" tabindex="-1" title="off" style="background-color: rgb(60, 60, 60); color: rgb(240, 240, 240); border-color: rgb(60, 60, 60);" data-focusable="true">
                ${[["none", "Do Nothing"], ["screen", "Display Program Screen"], ["run", "Run Program"]].map((i) => `<option value="${i[0]}">${i[1]}</option>`)}
              </select>
            </div>
          </div>
        </div>

        <script nonce="${nonce}" src="${scriptUri}"></script>

      </body>
    </html>`;
    }
    setSlot(document, e) {
        const json = this.getDocumentAsJson(document);
        json["py/state"]["upload_options"]["slot"] = parseInt(e["slot"]);
        return this.updateTextDocument(document, json);
    }
    setName(document, e) {
        const json = this.getDocumentAsJson(document);
        json["py/state"]["project_name"] = e["projectName"];
        return this.updateTextDocument(document, json);
    }
    setDesc(document, e) {
        const json = this.getDocumentAsJson(document);
        json["py/state"]["upload_options"]["description"] = e["description"];
        return this.updateTextDocument(document, json);
    }
    setIcon(document, e) {
        const json = this.getDocumentAsJson(document);
        json["py/state"]["upload_options"]["icon"] = e["icon"];
        return this.updateTextDocument(document, json);
    }
    setAfter(document, e) {
        const json = this.getDocumentAsJson(document);
        json["py/state"]["upload_options"]["after"] = e["runafter"];
        return this.updateTextDocument(document, json);
    }
    /**
     * Try to get a current document as json text.
     */
    getDocumentAsJson(document) {
        const text = document.getText();
        if (text.trim().length === 0) {
            return {};
        }
        try {
            return JSON.parse(text);
        }
        catch (_a) {
            throw new Error("Could not get document as json. Content is not valid json");
        }
    }
    /**
     * Write out the json to a given document.
     */
    updateTextDocument(document, json) {
        const edit = new vscode.WorkspaceEdit();
        // Just replace the entire document every time for this example extension.
        // A more complete extension should compute minimal edits instead.
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(json, null, 2));
        return vscode.workspace.applyEdit(edit);
    }
}
exports.ProsProjectEditorProvider = ProsProjectEditorProvider;
ProsProjectEditorProvider.viewType = "pros.projectEditor";
//# sourceMappingURL=editor.js.map